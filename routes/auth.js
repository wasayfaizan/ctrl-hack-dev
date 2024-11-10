// ... existing code ...

// Login route handler
router.get("/login", (req, res) => {
  console.log("GET /login - User:", req.user);
  if (req.user) {
    console.log("Redirecting authenticated user to /");
    return res.redirect("/");
  }
  res.render("login");
});

router.post("/login", async (req, res) => {
  try {
    console.log("POST /login - Before login logic");
    // ... your login logic ...

    console.log("POST /login - Token created:", token);
    res.cookie("jwt", token, cookieOptions);
    console.log("POST /login - Cookie set, about to redirect");

    // Try forcing a complete redirect with status code
    return res.status(302).redirect("/");
  } catch (error) {
    console.error("Login error:", error);
    return res.render("login", { error: "Invalid credentials" });
  }
});

// ... existing code ...
