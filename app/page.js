"use client";

import { useEffect, useState } from "react";
import "./style.css";

export default function Home() {
  const [task, setTask] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("agent-history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  function saveHistory(next) {
    setHistory(next);
    localStorage.setItem("agent-history", JSON.stringify(next));
  }

  function startVoice() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Bu brauzer səs yazısını dəstəkləmir. iPhone-da Safari və ya Chrome istifadə et.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "az-AZ";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      setTask(event.results[0][0].transcript);
    };
    recognition.start();
  }

  async function submitTask(e) {
    e.preventDefault();
    const cleanTask = task.trim();
    if (!cleanTask || loading) return;

    setLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: cleanTask })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Xəta baş verdi");

      setAnswer(data.answer);
      saveHistory([
        { task: cleanTask, answer: data.answer, date: new Date().toISOString() },
        ...history
      ].slice(0, 20));
      setTask("");
    } catch (error) {
      setAnswer("Xəta: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell">
      <section className="card">
        <div className="badge">PERSONAL AI</div>
        <h1>Mənə nə etmək lazımdır?</h1>
        <p className="subtitle">
          Yaz və ya mikrofona bas. İlk versiya araşdırır, plan hazırlayır və qeydləri saxlayır.
        </p>

        <form onSubmit={submitTask}>
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Məsələn: Milpitas yaxınlığında həftəsonu motosiklet kursu tap..."
            rows={5}
          />
          <div className="actions">
            <button type="button" className="voice" onClick={startVoice}>
              {listening ? "Dinləyirəm..." : "🎙 Danış"}
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "İşləyir..." : "Göndər"}
            </button>
          </div>
        </form>

        {answer && (
          <div className="answer">
            <strong>AI cavabı</strong>
            <p>{answer}</p>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="history">
          <h2>Son tapşırıqlar</h2>
          {history.map((item, index) => (
            <article key={index}>
              <strong>{item.task}</strong>
              <p>{item.answer}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
