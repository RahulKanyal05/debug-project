"use client";

import { color } from "framer-motion";
import Script from "next/script";
import { useEffect } from "react";

export default function PracticeInterview() {
  useEffect(() => {
    // If you need to run anything from main.js, make sure it's accessible globally or bound to events
  }, []);

  return (
    <>

      {/* Load external JS script */}
      
  <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
      <Script src="/main.js" />

      {/* Load external CSS */}
      

      {/* Page content */}
      <div id="backgroundVideoContainer">
        <video id="backgroundVideo" autoPlay muted loop>
          <source src="/video1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <section>
        <h1>Virtual AI Interviewer</h1>
        <p>Available In Chrome Only</p>

        {/* Upload Section */}
        <div id="uploadSection">
          <input type="file" id="resume" accept=".pdf,.doc,.docx,.txt" />
          <select id="jobRole" defaultValue="">
            <option value="" disabled>
                  Select Interview Type
                </option>
                  <option value="hr interview">HR Interview</option>
                  <option value="software development technical interview">Software Development Technical Interview</option>
                  <option value="ml technical interview">ML Technical Interview</option>
                  <option value="application development technical interview">Application Development Technical Interview</option>
                  <option value="Resume Based Interview">Resume Based Interview</option>
          </select>
          <button id="start">Analyze Resume & Prepare</button>
        </div>

        <div id="loadingIndicator" style={{ display: "none" }}>Processing...</div>

        {/* ATS Display Section */}
        <div id="atsDisplaySection" style={{ display: "none" }}>
          <div id="atsScoreDisplay"></div>
          <div id="atsTipsDisplay"></div>
          <button id="proceedInterviewBtn">Start Interview</button>
        </div>

        {/* Interview Section */}
        <div id="container" style={{ display: "none" }}>
          <div className="texts"></div>
          <button id="answerComplete" disabled>
            Complete Answer
          </button>
          <button id="stop" disabled>Stop Interview</button>
        </div>

        {/* Post Interview */}
        <div id="postInterviewSection" style={{ display: "none" }}>
          <div id="thankYouMessage"></div>

          <div id="feedbackBlock">
            <h2>Feedback</h2>
            <textarea
              id="feedback"
              rows={4}
              cols={50}
              placeholder="Please provide your feedback here..."
            ></textarea>
            <button id="submitFeedback">Submit Feedback</button>
          </div>

          <div id="downloadButton">
            <button id="downloadPdfBtn" className="downloadButton1">
              Download Summary PDF
            </button>
          </div>
        </div>
      </section>

      <style jsx>{`
      * {
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

html {
    font-family: "Montserrat", sans-serif;
    font-size: 20px;
    scroll-behavior: smooth;
}

body {
    background: url('./assets/b1.webp') no-repeat center center fixed;
    background-size: cover;
    overflow-x: hidden;
    color: white;
}

section {
    min-height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    /* background-color: rgba(0, 0, 0, 0.8); */
    
    flex-direction: column;
    padding: 50px 20px;
    text-align: center;
}

h1 {
    font-size: 48px;
    margin-bottom: 15px;
    color: #FFD700; /* Gold color for the heading */
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
}

p {
    margin-bottom: 30px;
    font-size: 18px;
}

#uploadSection, #container, #thankYouMessage, #feedbackBlock {
    width: 100%;
    max-width: 550px;
    margin: 20px auto;
    text-align: left;
    background-color: rgba(255, 255, 255, 0.15);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.texts {
    margin-bottom: 30px;
}

.texts p {
    color: #333;
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 15px;
    text-align: left;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.question {
    background-color: #cce5ff; /* Light blue */
    border-left: 5px solid #007bff; /* Blue border */
}

.answer {
    background-color: #f8d7da; /* Light red */
    border-left: 5px solid #dc3545; /* Red border */
}

button {
    background-color: #28a745; /* Green */
    color: white;
    border: none;
    padding: 12px 25px;
    margin: 10px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, transform 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

button:hover {
    background-color: #218838; /* Darker green */
    transform: translateY(-3px);
}

button:disabled {
    background-color: #6c757d; /* Gray */
    cursor: not-allowed;
}

#feedback {
    width: 100%;
    padding: 15px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: rgba(255, 255, 255, 0.8);
    color: #333;
    font-size: 16px;
}

#jobRole {
    width: 100%;
    padding: 12px;
    border-radius: 5px;
    border: 1px solid #ccc;
    margin-bottom: 20px;
    background-color: #f1f1f1;
    font-size: 16px;
    color: #333;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

#jobRole:hover {
    background-color: #e2e6ea;
}

#thankYouMessage {
    font-size: 24px;
    color: #FFD700; /* Gold color for the thank you message */
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

input[type="file"] {
    background-color: #f1f1f1;
    border-radius: 5px;
    padding: 10px;
    width: 100%;
    margin-bottom: 20px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

input[type="file"]:hover {
    background-color: #e2e6ea;
}

#downloadButton {
    display: none;
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 15px 32px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
}
#downloadButton:hover {
    background-color: #45a049;
}

.downloadButton1{
    color: black;
}

#backgroundVideoContainer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: -1; /* Makes sure the video stays in the background */
  }
  
  #backgroundVideo {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    object-fit: cover; /* Ensures the video covers the entire container */
    transform: translate(-50%, -50%); /* Centers the video */
  }
  
`}
  
      </style>
    </>
  );
}
