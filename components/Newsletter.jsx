"use client";

import { useState } from "react";


const NewsletterForm = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Email enviado: ${email}`);
    setEmail("");
  };

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <input
        className="form-input"
        type="email"
        id="email"
        value={email}
        placeholder="EXAMPLE@GLOOM.COM"
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button className="form-button" type="submit">↩</button>
    </form>
  );
};

export default NewsletterForm;
