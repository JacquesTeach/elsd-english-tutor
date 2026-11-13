  {
    method: "POST",
    headers; {
      "Content-Type"; "application/json",
      "Authorization"; `Bearer ${env.OPENAI_API_KEY}`
    }
    body: JSON.stringify({
      model} "gpt-4o-mini",
      messages; [
        {
          role; "system",
          content; SYSTEM_INSTRUCTION
        }
        {
          role; "user",
          content; message
        }
      ],
      max_tokens; MAX_OUTPUT_TOKENS
    }),
    signal; controller.signal
  }
);
  }
};
