(() => {
  "use strict";

  const state = {
    user: JSON.parse(localStorage.getItem("mindmetrixUser") || "null"),
    questions: [],
    current: 0,
    answers: {},
    review: new Set(),
    seconds: 900,
    timerId: null,
    started: false,
    submitted: false,
    history: JSON.parse(localStorage.getItem("mindmetrixHistory") || "[]")
  };

  const $ = id => document.getElementById(id);

  const screens = ["home", "details", "test", "result", "dashboard", "how"];

  function showScreen(name) {
    screens.forEach(screen => {
      const element = $(${screen}Screen);
      if (element) {
        element.classList.toggle("active", screen === name);
      }
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

    if (name === "dashboard") {
      renderDashboard();
    }
  }

  function toast(message) {
    const element = $("toast");

    if (!element) return;

    element.textContent = message;
    element.classList.add("show");

    clearTimeout(toast.timer);

    toast.timer = setTimeout(() => {
      element.classList.remove("show");
    }, 2400);
  }

  function saveHistory() {
    localStorage.setItem(
      "mindmetrixHistory",
      JSON.stringify(state.history)
    );
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString([], {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function updateProfile() {
    const name = state.user?.name || "Guest";

    if ($("profileBtn")) {
      $("profileBtn").textContent = name.split(" ")[0];
    }

    if ($("welcomeTitle")) {
      $("welcomeTitle").textContent =
        Welcome back, ${name.split(" ")[0]} 👋;
    }
  }

  function openTest() {
    showScreen("details");

    if (state.user) {
      $("nameInput").value = state.user.name || "";
      $("rollInput").value = state.user.roll || "";
      $("branchInput").value = state.user.branch || "";
      $("yearInput").value = state.user.year || "2nd Year";
    }
  }

  function startTest(event) {
    event.preventDefault();

    state.user = {
      name: $("nameInput").value.trim(),
      roll: $("rollInput").value.trim(),
      branch: $("branchInput").value,
      year: $("yearInput").value,
      difficulty: $("difficultyInput").value,
      category: $("categoryInput").value
    };

    if (!state.user.name || !state.user.roll || !state.user.branch) {
      toast("Please complete all required details.");
      return;
    }

    localStorage.setItem(
      "mindmetrixUser",
      JSON.stringify(state.user)
    );

    state.questions = getQuestionSet(
      state.user.category,
      state.user.difficulty
    );

    if (state.questions.length === 0) {
      toast("No questions match that selection.");
      return;
    }

    state.current = 0;
    state.answers = {};
    state.review = new Set();
    state.seconds = 900;
    state.started = true;
    state.submitted = false;

    clearInterval(state.timerId);

    state.timerId = setInterval(tick, 1000);

    showScreen("test");
    renderQuestion();
    updateTimer();
  }

  function tick() {
    if (state.submitted) return;

    state.seconds--;

    if (state.seconds <= 0) {
      state.seconds = 0;

      updateTimer();

      clearInterval(state.timerId);

      toast("Time is up. Submitting your test.");

      setTimeout(submitTest, 500);

      return;
    }

    updateTimer();
  }

  function updateTimer() {
    const minutes = String(
      Math.floor(state.seconds / 60)
    ).padStart(2, "0");

    const seconds = String(
      state.seconds % 60
    ).padStart(2, "0");

    const timer = $("timer");

    if (!timer) return;

    timer.textContent = ${minutes}:${seconds};

    timer.classList.toggle(
      "warning",
      state.seconds <= 300 && state.seconds > 60
    );

    timer.classList.toggle(
      "danger",
      state.seconds <= 60
    );
  }

  function renderQuestion() {
    const question = state.questions[state.current];

    if (!question) return;

    $("testTitle").textContent =
      Question ${state.current + 1} of ${state.questions.length};

    $("questionNumber").textContent =
      Q${state.current + 1};

    $("categoryBadge").textContent =
      question.category;

    $("difficultyBadge").textContent =
      question.difficulty;

    $("questionText").textContent =
      question.text;

    const answered =
      Object.keys(state.answers).length;

    const percentage =
      Math.round(
        (answered / state.questions.length) * 100
      );

    $("progressText").textContent =
      ${percentage}%;

    $("progressFill").style.width =
      ${percentage}%;

    $("answeredCount").textContent =
      ${answered} answered;

    $("reviewBtn").textContent =
      state.review.has(question.id)
        ? "★ Remove Review"
        : "☆ Mark for Review";

    $("prevBtn").disabled =
      state.current === 0;

    $("nextBtn").textContent =
      state.current === state.questions.length - 1
        ? "Submit Test"
        : "Next →";

    $("options").innerHTML =
      question.options
        .map((option, index) => {
          const selected =
            state.answers[question.id] === index;

          return `
            <button
              class="option ${selected ? "selected" : ""}"
              data-option="${index}">
              ${String.fromCharCode(65 + index)}. ${option}
            </button>
          `;
        })
        .join("");

    $("explanationBox").classList.add("hidden");

    renderQuestionNav();
  }

  function renderQuestionNav() {
    $("questionNav").innerHTML =
      state.questions
        .map((question, index) => {
          const classes = [
            index === state.current ? "current" : "",
            state.answers[question.id] !== undefined
              ? "answered"
              : "",
            state.review.has(question.id)
              ? "review"
              : ""
          ]
            .filter(Boolean)
            .join(" ");

          return `
            <button
              class="${classes}"
              data-q="${index}"
              title="Question ${index + 1}">
              ${index + 1}
            </button>
          `;
        })
        .join("");
  }

  function selectOption(index) {
    const question =
      state.questions[state.current];

    if (!question) return;

    state.answers[question.id] = index;

    renderQuestion();
  }

  function toggleReview() {
    const id =
      state.questions[state.current].id;

    if (state.review.has(id)) {
      state.review.delete(id);
    } else {
      state.review.add(id);
    }

    renderQuestion();
  }

  function submitTest() {
    if (state.submitted) return;

    state.submitted = true;

    clearInterval(state.timerId);

    const result = calculateResult();

    state.history.unshift(result);

    state.history =
      state.history.slice(0, 10);

    saveHistory();

    renderResult(result);

    showScreen("result");
  }

  function calculateResult() {
    let correct = 0;
    let skipped = 0;

    const categories = {
      Quantitative: {
        correct: 0,
        total: 0
      },

      Logical: {
        correct: 0,
        total: 0
      },

      Verbal: {
        correct: 0,
        total: 0
      }
    };

    state.questions.forEach(question => {
      categories[question.category].total++;

      if (
        state.answers[question.id] === undefined
      ) {
        skipped++;
      } else if (
        state.answers[question.id] === question.answer
      ) {
        correct++;
        categories[question.category].correct++;
      }
    });

    const total = state.questions.length;

    const wrong =
      total - correct - skipped;

    const percentage =
      Math.round((correct / total) * 100);

    let level;

    if (percentage >= 90) {
      level = "Excellent 🏆";
    } else if (percentage >= 75) {
      level = "Very Good ⭐";
    } else if (percentage >= 60) {
      level = "Good 👍";
    } else if (percentage >= 40) {
      level = "Needs Improvement 📚";
    } else {
      level = "Keep Practicing 💪";
    }

    return {
      id: Date.now(),
      date: new Date().toISOString(),
      name: state.user?.name || "Guest",
      score: correct,
      total,
      wrong,
      skipped,
      pct: percentage,
      level,
      cats: categories
    };
  }

  function renderResult(result) {
    $("scoreValue").textContent =
      ${result.score}/${result.total};

    $("percentageValue").textContent =
      ${result.pct}%;

    $("resultTitle").textContent =
      result.pct >= 75
        ? "Excellent work! 🎉"
        : "Test completed! 🎯";

    $("performanceMessage").textContent =
      ${result.level} Your strongest area is ${bestCategory(result)}.;

    const degrees =
      Math.round(result.pct * 3.6);

    $("scoreValue").parentElement.style.background =
      `conic-gradient(
        var(--primary) ${degrees}deg,
        #e8ebf3 ${degrees}deg
      )`;

    $("correctStat").textContent =
      result.score;

    $("wrongStat").textContent =
      result.wrong;

    $("skippedStat").textContent =
      result.skipped;

    $("levelResult").textContent =
      result.level;

    $("categoryResults").innerHTML =
      Object.entries(result.cats)
        .map(([category, value]) => {
          const percentage =
            value.total
              ? Math.round(
                  (value.correct / value.total) * 100
                )
              : 0;

          return `
            <div class="category-result">
              <div class="row">
                <span>${category}</span>
                <b>
                  ${value.correct}/${value.total}
                  • ${percentage}%
                </b>
              </div>

              <div class="mini-bar">
                <div style="width:${percentage}%"></div>
              </div>
            </div>
          `;
        })
        .join("");

    const weakestCategories =
      Object.entries(result.cats)
        .sort((a, b) => {
          const aScore =
            a[1].total
              ? a[1].correct / a[1].total
              : 0;

          const bScore =
            b[1].total
              ? b[1].correct / b[1].total
              : 0;

          return aScore - bScore;
        });

    $("improvementList").innerHTML =
      weakestCategories
        .slice(0, 3)
        .map(([category, value]) => {
          const percentage =
            value.total
              ? Math.round(
                  (value.correct / value.total) * 100
                )
              : 0;

          return `
            <div>
              ${percentage >= 75 ? "🟢" : "🟡"}
              <b>${category}</b> —
              ${percentage}%:
              ${
                percentage >= 75
                  ? "Keep practicing to maintain your strength."
                  : "Practice more questions in this category to improve accuracy."
              }
            </div>
          `;
        })
        .join("");
  }

  function bestCategory(result) {
    const entries =
      Object.entries(result.cats);

    if (!entries.length) {
      return "your skills";
    }

    entries.sort((a, b) => {
      const aScore =
        a[1].total
          ? a[1].correct / a[1].total
          : 0;

      const bScore =
        b[1].total
          ? b[1].correct / b[1].total
          : 0;

      return bScore - aScore;
    });

    return entries[0][0];
  }

  function reviewAnswers() {
    showScreen("test");

    state.current = 0;

    state.submitted = true;

    $("reviewBtn").style.visibility =
      "hidden";

    renderReviewQuestion();
  }

  function renderReviewQuestion() {
    const question =
      state.questions[state.current];

    if (!question) return;

    const selected =
      state.answers[question.id];

    $("testTitle").textContent =
      Review ${state.current + 1} of ${state.questions.length};

    $("questionNumber").textContent =
      Q${state.current + 1};

    $("categoryBadge").textContent =
      question.category;

    $("difficultyBadge").textContent =
      question.difficulty;

    $("questionText").textContent =
      question.text;

    $("options").innerHTML =
      question.options
        .map((option, index) => {
          let className = "";

          if (index === question.answer) {
            className = "correct";
          }

          if (
            index === selected &&
            selected !== question.answer
          ) {
            className = "wrong";
          }

          return `
            <button
              class="option ${className}"
              disabled>
              ${String.fromCharCode(65 + index)}.
              ${option}
              ${index === question.answer ? " ✓" : ""}
            </button>
          `;
        })
        .join("");

    $("explanationBox").classList.remove(
      "hidden"
    );

    $("explanationBox").textContent =
      Explanation: ${question.explanation};

    const percentage =
      Math.round(
        ((state.current + 1) /
          state.questions.length) *
          100
      );

    $("progressFill").style.width =
      ${percentage}%;

    $("progressText").textContent =
      ${percentage}%;

    $("answeredCount").textContent =
      ${Object.keys(state.answers).length} answered;

    $("prevBtn").disabled =
      state.current === 0;

    $("nextBtn").textContent =
      state.current === state.questions.length - 1
        ? "Back to Result"
        : "Next →";

    renderQuestionNav();
  }

  function renderDashboard() {
    const history = state.history;

    $("dashTests").textContent =
      history.length;

    $("dashLatest").textContent =
      history[0]
        ? ${history[0].pct}%
        : "—";

    $("dashBest").textContent =
      history.length
        ? ${Math.max(...history.map(item => item.pct))}%
        : "—";

    $("dashAverage").textContent =
      history.length
        ? `${Math.round(
            history.reduce(
              (sum, item) => sum + item.pct,
              0
            ) / history.length
          )}%`
        : "—";

    $("leaderYou").textContent =
      history[0]
        ? ${history[0].pct}%
        : "—";

    const latest = history[0];

    const values = latest
      ? Object.entries(latest.cats)
          .map(([category, value]) => ({
            cat: category,
            p: value.total
              ? Math.round(
                  (value.correct / value.total) *
                    100
                )
              : 0
          }))
      : [
          { cat: "Quantitative", p: 0 },
          { cat: "Logical", p: 0 },
          { cat: "Verbal", p: 0 }
        ];

    $("chartBars").innerHTML =
      values
        .map(item => `
          <div>
            <b>${item.p}%</b>
            <div
              class="chart-bar"
              style="height:${Math.max(
                8,
                item.p
              )}%">
            </div>
            <small>
              ${item.cat.slice(0, 3)}
            </small>
          </div>
        `)
        .join("");

    $("skillSnapshot").innerHTML =
      values
        .map(item => `
          <div class="skill-row">
            <div>
              <span>${item.cat}</span>
              <b>${item.p}%</b>
            </div>

            <div class="mini-bar">
              <div
                style="width:${item.p}%">
              </div>
            </div>
          </div>
        `)
        .join("");

    $("historyList").innerHTML =
      history.length
        ? history
            .map(item => `
              <div class="history-item">
                <div>
                  <b>
                    ${item.score}/${item.total}
                  </b>

                  <small>
                    ${formatDate(item.date)}
                    • ${item.level}
                  </small>
                </div>

                <span class="history-score">
                  ${item.pct}%
                </span>
              </div>
            `)
            .join("")
        : `
          <div class="history-item">
            No tests completed yet.
            Take your first test!
          </div>
        `;
  }

  document.addEventListener("click", event => {
    const screenButton =
      event.target.closest("[data-screen]");

    if (screenButton) {
      event.preventDefault();

      showScreen(
        screenButton.dataset.screen
      );

      return;
    }

    const actionButton =
      event.target.closest("[data-action]");

    if (
      actionButton &&
      actionButton.dataset.action ===
        "open-test"
    ) {
      openTest();
      return;
    }

    const option =
      event.target.closest("[data-option]");

    if (
      option &&
      state.started &&
      !state.submitted
    ) {
      selectOption(
        Number(option.dataset.option)
      );

      return;
    }

    const questionButton =
      event.target.closest("[data-q]");

    if (
      questionButton &&
      !state.submitted
    ) {
      state.current =
        Number(questionButton.dataset.q);

      renderQuestion();
    }
  });

  $("detailsForm").addEventListener(
    "submit",
    startTest
  );

  $("prevBtn").addEventListener(
    "click",
    () => {
      if (state.current > 0) {
        state.current--;

        if (state.submitted) {
          renderReviewQuestion();
        } else {
          renderQuestion();
        }
      }
    }
  );

  $("nextBtn").addEventListener(
    "click",
    () => {
      if (
        state.current <
        state.questions.length - 1
      ) {
        state.current++;

        if (state.submitted) {
          renderReviewQuestion();
        } else {
          renderQuestion();
        }
      } else if (state.submitted) {
        $("reviewBtn").style.visibility =
          "visible";

        showScreen("result");
      } else {
        submitTest();
      }
    }
  );

  $("reviewBtn").addEventListener(
    "click",
    toggleReview
  );

  $("retakeBtn").addEventListener(
    "click",
    () => {
      openTest();
    }
  );

  $("reviewAnswersBtn").addEventListener(
    "click",
    reviewAnswers
  );

  $("downloadBtn").addEventListener(
    "click",
    () => {
      window.print();
    }
  );

  $("themeBtn").addEventListener(
    "click",
    () => {
      document.body.classList.toggle(
        "dark"
      );

      const dark =
        document.body.classList.contains(
          "dark"
        );

      localStorage.setItem(
        "mindmetrixTheme",
        dark ? "dark" : "light"
      );

      $("themeBtn").textContent =
        dark ? "☀️" : "☾";
    }
  );

  $("profileBtn").addEventListener(
    "click",
    () => {
      if (state.user) {
        toast(
          Signed in locally as ${state.user.name}
        );
      } else {
        openTest();
      }
    }
  );

  if (
    localStorage.getItem(
      "mindmetrixTheme"
    ) === "dark"
  ) {
    document.body.classList.add("dark");
    $("themeBtn").textContent = "☀️";
  }

  updateProfile();
  renderDashboard();

})();
