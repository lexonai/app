/* =========================================================================
   LEXON AI — Starter Question Library
   =========================================================================
   Ships with the app so "Continue Learning" works immediately with zero
   backend setup. Designed to be extended: once a Supabase "questions"
   table (id, question, answer, level, status, created_at) is populated,
   pages/learn.html merges those rows on top of this list automatically,
   fetched in pages of 200 so the browser never loads the full library
   (target: 1,000–2,000 questions) into memory at once.
   ========================================================================= */

window.LexonLearnQuestions = [

  // ---------------------------------------------------------------------
  // Beginner
  // ---------------------------------------------------------------------
  {
    id: "b-what-is-ai",
    level: "beginner",
    question: "What is AI?",
    answer: "AI (Artificial Intelligence) is technology that lets computers perform tasks that normally need human thinking — understanding language, recognizing images, making predictions, or generating new content. Instead of following one fixed set of rules, most modern AI learns patterns from large amounts of data."
  },
  {
    id: "b-what-is-chatgpt",
    level: "beginner",
    question: "What is ChatGPT?",
    answer: "ChatGPT is a conversational AI tool built on a large language model. You type a question or instruction in plain language, and it responds with text — answers, drafts, explanations, code, and more. It's one of the most common ways people first interact with AI."
  },
  {
    id: "b-what-is-ai-model",
    level: "beginner",
    question: "What is an AI model?",
    answer: "An AI model is the trained \"brain\" behind an AI tool. It's created by feeding an algorithm huge amounts of data so it learns patterns — for example, how words relate to each other, or what objects look like in photos. Different models are trained for different jobs: text, images, video, code, and more."
  },
  {
    id: "b-what-is-ai-tool",
    level: "beginner",
    question: "What is an AI tool?",
    answer: "An AI tool is an app or website built around one or more AI models to solve a specific task — writing, editing images, generating video, automating work, or coding. The tool handles the interface; the AI model underneath does the actual \"thinking.\""
  },
  {
    id: "b-what-is-prompting",
    level: "beginner",
    question: "What is prompting?",
    answer: "Prompting is the instruction or question you give an AI to get the response you want. The clearer and more specific your prompt — what you want, in what format, for what purpose — the better and more useful the AI's answer will be."
  },
  {
    id: "b-what-is-llm",
    level: "beginner",
    question: "What is an LLM?",
    answer: "LLM stands for Large Language Model — an AI system trained on massive amounts of text so it can understand and generate human-like language. ChatGPT, Claude, and Gemini are all built on LLMs."
  },
  {
    id: "b-what-is-generative-ai",
    level: "beginner",
    question: "What is generative AI?",
    answer: "Generative AI is AI that creates new content — text, images, video, audio, or code — instead of just analyzing or classifying existing content. When you ask an AI to write a paragraph or generate an image, that's generative AI at work."
  },
  {
    id: "b-what-is-machine-learning",
    level: "beginner",
    question: "What is machine learning?",
    answer: "Machine learning is the branch of AI where a computer improves at a task by learning from data and examples, rather than being explicitly programmed with fixed rules for every situation. It's the foundation most modern AI, including LLMs, is built on."
  },
  {
    id: "b-what-is-deep-learning",
    level: "beginner",
    question: "What is deep learning?",
    answer: "Deep learning is a type of machine learning that uses layered structures called neural networks, loosely inspired by the human brain. It's especially good at finding complex patterns in large datasets, which is why it powers most modern language and image models."
  },
  {
    id: "b-how-to-use-chatgpt",
    level: "beginner",
    question: "How do I use AI tools?",
    answer: "Start with a clear goal — what output do you want? Then describe it to the AI in plain language, including any context, format, or constraints that matter. Review the result, and refine your instructions if it's not quite right. Most AI tools improve a lot with a second, more specific prompt."
  },
  {
    id: "b-what-is-ai-agent",
    level: "beginner",
    question: "What is an AI agent?",
    answer: "An AI agent is an AI system that can take actions on its own toward a goal — not just answer a question, but plan steps, use tools, and complete multi-step tasks with little or no human input at each step."
  },
  {
    id: "b-what-is-ai-automation",
    level: "beginner",
    question: "What is AI automation?",
    answer: "AI automation means using AI to handle repetitive or multi-step tasks automatically — like sorting emails, replying to common questions, or moving data between apps — so a person doesn't have to do them manually every time."
  },
  {
    id: "b-what-is-ai-workflow",
    level: "beginner",
    question: "What is an AI workflow?",
    answer: "An AI workflow is a connected sequence of steps — often across multiple tools — where AI handles part or all of the process automatically. For example: a new form submission triggers an AI summary, which is then automatically emailed to the right person."
  },
  {
    id: "b-ai-vs-automation",
    level: "beginner",
    question: "What's the difference between AI and automation?",
    answer: "Automation follows fixed, predictable steps (\"if this happens, do that\"). AI adds judgment — it can understand context, handle unexpected input, and make decisions. Many modern tools combine both: automation for the structure, AI for the thinking."
  },
  {
    id: "b-is-ai-free",
    level: "beginner",
    question: "Are AI tools free to use?",
    answer: "It depends on the tool. Many AI tools offer a free tier with limited usage, and a paid plan for higher limits or advanced features. Some tools are entirely free, others are fully paid. LEXON AI clearly labels each resource as Free or Paid so you always know before you click through."
  },

  // ---------------------------------------------------------------------
  // Intermediate
  // ---------------------------------------------------------------------
  {
    id: "i-how-do-ai-models-work",
    level: "intermediate",
    question: "How do AI models work?",
    answer: "Most modern AI models are neural networks trained on large datasets. During training, the model repeatedly makes predictions, compares them to the correct answer, and adjusts its internal parameters to reduce errors. After enough training, it can generalize — producing reasonable outputs for new inputs it has never seen before."
  },
  {
    id: "i-productivity-with-ai",
    level: "intermediate",
    question: "How can I use AI for productivity?",
    answer: "Use AI to handle the repetitive, time-consuming parts of your work — first drafts, summarizing long documents, organizing notes, generating meeting follow-ups, or answering routine questions. The time you save is best spent on the judgment calls AI can't make for you."
  },
  {
    id: "i-how-to-automate-tasks",
    level: "intermediate",
    question: "How do I automate tasks with AI?",
    answer: "Start by mapping the exact steps you repeat manually. Then look for a no-code automation tool (like Zapier, Make, or n8n) that can connect your apps, and add an AI step wherever judgment or content generation is needed — for example, writing a reply or categorizing an item — instead of a rigid rule."
  },
  {
    id: "i-how-to-build-ai-workflow",
    level: "intermediate",
    question: "How do I build an AI workflow?",
    answer: "Define the trigger (what starts the workflow), the steps in between (including where AI adds value), and the outcome. Build it incrementally — get one connection working end-to-end before adding the next — and test with real examples, not just ideal-case data."
  },
  {
    id: "i-how-to-use-apis-with-ai",
    level: "intermediate",
    question: "How do I use APIs with AI?",
    answer: "An API lets your own app or script send requests directly to an AI model and get a response back in code, instead of using a chat interface by hand. Most AI providers document their API with example requests — you typically send your prompt as structured data (often JSON) and receive the model's response the same way."
  },
  {
    id: "i-write-better-prompts",
    level: "intermediate",
    question: "How do I write better prompts?",
    answer: "Be specific about the goal, the audience, the format, and any constraints. Give examples of what \"good\" looks like when you can. Break complex requests into steps. And treat the first response as a draft — refining your prompt based on what came back usually gets you to a better result faster than starting over."
  },
  {
    id: "i-what-is-prompt-engineering",
    level: "intermediate",
    question: "What is prompt engineering?",
    answer: "Prompt engineering is the practice of deliberately designing and refining prompts to get more reliable, accurate, or specific results from an AI model — especially useful for repeated or production use cases, not just one-off questions."
  },
  {
    id: "i-what-is-context-window",
    level: "intermediate",
    question: "What is a context window?",
    answer: "A context window is the amount of text an AI model can \"see\" and consider at once — your prompt, any attached documents, and the conversation history. If a conversation or document is longer than the context window, older parts may be dropped or summarized."
  },
  {
    id: "i-what-is-fine-tuning",
    level: "intermediate",
    question: "What is fine-tuning?",
    answer: "Fine-tuning is additional training applied to an existing AI model using a smaller, specific dataset, to make it better at a particular task or style — for example, matching a company's tone of voice or a specialized domain like legal or medical text."
  },
  {
    id: "i-what-is-rag",
    level: "intermediate",
    question: "What is RAG (retrieval-augmented generation)?",
    answer: "RAG is a technique where an AI model looks up relevant information from an external source — like a document database — before generating its answer. This lets it give more accurate, up-to-date responses instead of relying only on what it learned during training."
  },
  {
    id: "i-choose-right-ai-tool",
    level: "intermediate",
    question: "How do I choose the right AI tool for a task?",
    answer: "Start from the output you need, not the tool. Video generation, image editing, coding, and automation each have specialized tools that outperform general-purpose chat assistants for that specific job. Check whether a free tier covers your usage before committing to a paid plan."
  },
  {
    id: "i-what-is-hallucination",
    level: "intermediate",
    question: "What is an AI hallucination?",
    answer: "A hallucination is when an AI model confidently states something false or made up — a fake fact, source, or detail — because it's generating a statistically plausible answer rather than checking a source of truth. Always verify important facts an AI gives you, especially names, numbers, and citations."
  },

  // ---------------------------------------------------------------------
  // Advanced
  // ---------------------------------------------------------------------
  {
    id: "a-how-to-build-ai-agents",
    level: "advanced",
    question: "How do I build AI agents?",
    answer: "Define the agent's goal, the tools it's allowed to use (search, code execution, APIs), and how it should decide when a task is complete. Frameworks like LangChain, AutoGen, or CrewAI handle the orchestration — the loop of planning, acting, and evaluating results — so you can focus on the tools and guardrails specific to your use case."
  },
  {
    id: "a-design-ai-automation",
    level: "advanced",
    question: "How do I design AI automation at scale?",
    answer: "Separate deterministic steps (data movement, formatting) from AI-judgment steps (classification, generation, decisions). Add validation checks after AI steps before anything triggers a real-world action. And log every run so you can catch and fix failure patterns as volume grows."
  },
  {
    id: "a-connect-ai-tools",
    level: "advanced",
    question: "How do I connect multiple AI tools together?",
    answer: "Most AI tools expose either a REST API or support standard integration platforms (Zapier, Make, n8n). For tighter control, call each tool's API directly from your own backend and pass structured data (JSON) between steps, so each tool receives exactly the input format it expects."
  },
  {
    id: "a-build-ai-powered-app",
    level: "advanced",
    question: "How do I build an AI-powered application?",
    answer: "Pick the right model for your task and budget, design your prompts (or fine-tune) around real user inputs — not idealized examples — and build in error handling for slow responses, unexpected output, and API failures. Add usage limits and monitoring before you scale to real users."
  },
  {
    id: "a-create-advanced-workflows",
    level: "advanced",
    question: "How do I create advanced multi-step AI workflows?",
    answer: "Break the workflow into discrete stages with clear inputs and outputs at each step. Use conditional branching so the workflow can react differently to different AI outputs. And keep a human-review step for any branch that takes a consequential or irreversible action."
  },
  {
    id: "a-multi-agent-systems",
    level: "advanced",
    question: "What is a multi-agent system?",
    answer: "A multi-agent system uses several specialized AI agents that each handle part of a task and coordinate with each other — for example, one agent researches, another drafts, and a third reviews — rather than relying on a single agent to do everything."
  },
  {
    id: "a-evaluate-ai-model-performance",
    level: "advanced",
    question: "How do I evaluate an AI model's performance for my use case?",
    answer: "Build a small test set of real, representative inputs with known-good expected outputs. Run each candidate model against it and score accuracy, consistency, and cost per request. Re-test whenever you change the prompt, the model version, or the task itself — performance can shift more than expected."
  },
  {
    id: "a-ai-agent-guardrails",
    level: "advanced",
    question: "How do I add safety guardrails to an AI agent?",
    answer: "Restrict which tools and actions the agent can access, require explicit confirmation before irreversible actions (payments, deletions, sending messages), validate the agent's output before it's used downstream, and set hard limits on cost, steps, or time per task so a stuck agent can't run away."
  },
  {
    id: "a-vector-databases",
    level: "advanced",
    question: "What is a vector database and when do I need one?",
    answer: "A vector database stores content as numerical representations (embeddings) so you can search by meaning rather than exact keywords — the backbone of most RAG systems. You typically need one once you're searching across a large or frequently changing set of documents that a single prompt can't hold."
  },
  {
    id: "a-cost-optimize-ai-usage",
    level: "advanced",
    question: "How do I optimize the cost of AI usage at scale?",
    answer: "Use the smallest/cheapest model that still meets your quality bar for each specific task — not one large model for everything. Cache repeated or similar requests, trim unnecessary context from prompts, and batch non-urgent requests where the provider offers a lower-cost batch option."
  }

];
