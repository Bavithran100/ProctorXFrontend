import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import Client from "../Client";
import "../App.css";

export default function GenerateCodingAIQuestions() {
const SYSTEM_PROMPT = `
You are an expert programming exam generator.

Your task is to generate coding interview/exam questions and their reference solutions.

IMPORTANT:
Return ONLY valid JSON.
Do NOT use markdown.
Do NOT include explanations outside the JSON.

========================
QUESTION RULES
========================

Generate realistic coding interview questions.

Each question must contain:

- title
- description
- difficulty
- allowedLanguage
- referenceSolution

Do NOT generate:
- test cases
- expected outputs
- hints
- explanations

========================
REFERENCE SOLUTION RULES
========================

The reference solution MUST be a complete runnable Java program.

The class name MUST be:

public class Main

The solution MUST ALWAYS contain:

import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // solution

        sc.close();
    }
}

The reference solution MUST:

✓ Use Scanner for ALL input.
✓ Read input from System.in only.
✓ Print answers using System.out.print or System.out.println.
✓ Be directly compilable.
✓ Be directly executable.
✓ Have exactly one public class named Main.

========================
STRICTLY FORBIDDEN
========================

NEVER generate or import:

org.junit.*
junit.*
@Test
Assertions
assertEquals
assertTrue
assertFalse
Mockito
Spring Boot
JUnit
TestNG
Maven
Gradle
Packages other than java.util.*, java.io.*, java.math.*, java.lang.*

Do NOT create:

test methods
helper test classes
unit tests
mock tests
sample tests

Never generate:

public class Solution

Always generate:

public class Main

========================
INPUT FORMAT
========================

Always read input using Scanner.

Example:

Scanner sc = new Scanner(System.in);

int n = sc.nextInt();

String s = sc.next();

long x = sc.nextLong();

double d = sc.nextDouble();

========================
OUTPUT FORMAT
========================

Print ONLY the required output.

Do NOT print prompts like:

Enter number:
Input:
Output:

========================
ALGORITHM
========================

Generate the most efficient correct solution.

Respect the requested complexity.

========================
JSON FORMAT
========================

{
  "questions":[
    {
      "title":"",
      "description":"",
      "difficulty":"EASY",
      "allowedLanguage":"JAVA",
      "referenceSolution":""
    }
  ]
}
`;

  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const planningBrief = location.state?.plan;

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [inputs, setInputs] = useState({});
  const [solutions, setSolutions] = useState({});
  const [generatedOutput, setGeneratedOutput] = useState({});

  async function generate() {
    if (!planningBrief) {
      alert("Create an AI plan before generating coding questions");
      navigate(`/admin/exams/${examId}/coding-plan`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "qwen/qwen3.6-27b",
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              {
                role: "user",
                content: `Generate ${planningBrief.questionCount} coding questions using this planning brief:\n
Topic: ${planningBrief.topic}\n
Difficulty: ${planningBrief.difficulty || "EASY"}\n
Target complexity: ${planningBrief.targetComplexity || "Choose an appropriate efficient complexity"}\n
Input constraints: ${planningBrief.constraints || "Define realistic constraints"}\n
Test-case focus: ${planningBrief.testCaseFocus || "Cover normal, boundary, and edge cases"}\n
Additional instructions: ${planningBrief.additionalInstructions || "None"}\n
Return exactly ${planningBrief.questionCount} questions. Keep each reference solution correct, efficient, and compatible with Java class Main.`
              }
            ],
            temperature: 0.4
          })
        }
      );

      const data = await res.json();

      let content = data.choices[0].message.content;

      content = content.replace(/```json/g, "").replace(/```/g, "").trim();

      const parsed = JSON.parse(content);

      const questionsWithTC = (parsed.questions || []).map(q => ({
        ...q,
        testCases: [],
        referenceSolution: q.referenceSolution || ""
      }));

      setQuestions(questionsWithTC);

      setSolutions(
        questionsWithTC.reduce((acc, q, i) => {
          acc[i] = q.referenceSolution;
          return acc;
        }, {})
      );
    } catch (err) {
      console.error(err);
      alert("AI generation failed");
    } finally {
      setLoading(false);
    }
  }

  async function generateOutput(qIndex) {
    const input = inputs[qIndex];
    const solution = solutions[qIndex];

    if (!input) return alert("Enter input");
    if (!solution) return alert("Paste solution");

    try {
      const res = await Client.post("/code-execution/generate-output", {
        script: solution,
        stdin: input
      });
      const data = res.data;
      console.log(res);

      if (!data.stdout) {
        alert("Error in code");
        console.log(data);
        return;
      }

      setGeneratedOutput({
        ...generatedOutput,
        [qIndex]: data.stdout.trim().replace(/\s+/g, " ")
      });
    } catch (err) {
      console.error(err);
      alert("Judge error");
    }
  }

  function addTestCase(qIndex) {
    const input = inputs[qIndex];
    const output = generatedOutput[qIndex];

    if (!input || !output) {
      alert("Generate output first");
      return;
    }

    const updated = [...questions];

    updated[qIndex].testCases.push({
      input: input.trim(),
      expectedOutput: output
    });

    setQuestions(updated);

    setGeneratedOutput({
      ...generatedOutput,
      [qIndex]: ""
    });
  }

  async function save() {
    if (!planningBrief || questions.length !== Number(planningBrief.questionCount)) {
      alert(`Generate exactly ${planningBrief?.questionCount || 0} questions before saving`);
      return;
    }

    try {
      for (let q of questions) {
        await Client.post(`/admin/exams/${examId}/coding-questions`, {
          title: q.title,
          description: q.description,
          difficulty: q.difficulty,
          allowedLanguage: q.allowedLanguage,
          testCases: q.testCases
        });
      }

      alert("Saved successfully");
      navigate(`/admin/exams/${examId}/coding-manual`);
    } catch (err) {
      console.error(err);
      alert("Save failed");
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        <div className="page-header">
          <div>
            <div className="hero-badge">AI coding authoring</div>
            <h2>Generate Coding Questions</h2>
            <p>Draft coding prompts, validate sample outputs, and assemble testcase sets in one view.</p>
          </div>
        </div>

        {planningBrief && (
          <div className="field-panel">
            <p><b>AI plan:</b> {planningBrief.topic}</p>
            <p className="helper-text">
              {planningBrief.questionCount} questions · {planningBrief.difficulty} · {planningBrief.targetComplexity || "efficient solution"}
            </p>
          </div>
        )}

        <button className="primary-btn" onClick={generate} style={{ marginTop: "20px" }}>
          {loading ? "Generating..." : "Generate"}
        </button>

        {loading && (
          <div className="preview-stack" style={{ marginTop: "20px" }}>
            <div className="skeleton-card" />
          </div>
        )}

        {questions.length > 0 && (
          <>
            <h3 style={{ marginTop: "26px" }}>Preview</h3>

            {questions.map((q, i) => (
              <div key={i} className="question-preview">
                <h4>{q.title}</h4>
                <p>{q.description}</p>

                <p>Difficulty: {q.difficulty}</p>
                <p>Marks: assigned automatically from the exam total</p>

                <div className="editor-shell">
                  <div className="editor-toolbar">
                    <strong>Reference Solution</strong>
                    <span>Java template from the generated output</span>
                  </div>
                  <Editor
                    height="300px"
                    defaultLanguage="java"
                    value={solutions[i] || ""}
                    theme="vs-dark"
                    onChange={(value) =>
                      setSolutions({ ...solutions, [i]: value })
                    }
                  />
                </div>

                <div className="field-panel">
                  <p className="helper-text">
                    Input Guide: Single -&gt; 5 | Two -&gt; 5 10 | Array -&gt; line one size, line two values, line three extra argument.
                  </p>

                  <div className="field-stack">
                    <label>Input</label>
                    <textarea
                      placeholder="Enter input"
                      onChange={(e) =>
                        setInputs({ ...inputs, [i]: e.target.value })
                      }
                    />
                  </div>

                  <div className="button-row">
                    <button className="ghost-btn" onClick={() => generateOutput(i)}>
                      Generate Output
                    </button>

                    <button className="secondary-btn" onClick={() => addTestCase(i)}>
                      Add Testcase
                    </button>
                  </div>

                  <div className="field-stack" style={{ marginTop: "16px" }}>
                    <label>Output</label>
                    <pre>{generatedOutput[i]}</pre>
                  </div>
                </div>

                <p><b>Testcases</b></p>

                <div className="results-stack">
                  {(q.testCases || []).map((t, j) => (
                    <div key={j} className="testcase-card">
                      <h4>Testcase {j + 1}</h4>
                      <span className="label">Input</span>
                      <pre>{t.input}</pre>
                      <span className="label">Output</span>
                      <pre>{t.expectedOutput}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button className="submit-btn" onClick={save}>
              Save Questions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
