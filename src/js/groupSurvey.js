const triggers = [
    { id: "guns", label: "Guns" },
    { id: "explicit-scenes", label: "Sexually explicit scenes" },
    { id: "graphic-violence", label: "Graphic violence" },
];

export function recommendMovies(movies, allowedTriggers) {
    return movies
        .filter(movie => Array.isArray(movie.triggers)
            && movie.triggers.every(trigger => allowedTriggers.has(trigger)))
        .slice(0, 5);
}

export function setupGroupSurvey(section) {
    const form = section.querySelector("form");
    const survey = section.querySelector(".group-survey_questions");
    const question = survey.querySelector("h3");
    const result = section.querySelector(".group-survey_result");
    const status = section.querySelector("[role=status]");
    let memberCount;
    let memberIndex;
    let triggerIndex;
    let allowedTriggers;

    function showQuestion() {
        status.textContent = `Participant ${memberIndex + 1} of ${memberCount}. Question ${triggerIndex + 1} of ${triggers.length}.`;
        question.textContent = triggers[triggerIndex].label;
        question.focus();
    }

    async function showResults() {
        survey.hidden = true;
        result.hidden = false;
        result.focus();
        result.textContent = allowedTriggers.size
            ? `Allowed by everyone: ${triggers.filter(trigger => allowedTriggers.has(trigger.id)).map(trigger => trigger.label).join(", ")}.`
            : "No listed triggers were allowed by everyone.";
        status.textContent = "Loading sample recommendations…";

        try {
            const response = await fetch(new URL("../data/mockData.json", import.meta.url));
            if (!response.ok) throw new Error("Sample data unavailable");
            const movies = recommendMovies(await response.json(), allowedTriggers);
            status.textContent = movies.length ? "" : "No sample movies match this group.";
            if (movies.length) {
                const list = document.createElement("ol");
                for (const movie of movies) {
                    const item = document.createElement("li");
                    item.textContent = movie.title;
                    list.append(item);
                }
                result.append(list);
            }
        } catch {
            status.textContent = "Sample recommendations could not be loaded.";
        } finally {
            form.hidden = false;
        }
    }

    form.addEventListener("submit", event => {
        event.preventDefault();
        memberCount = form.elements.members.valueAsNumber;
        memberIndex = 0;
        triggerIndex = 0;
        allowedTriggers = new Set(triggers.map(trigger => trigger.id));
        form.hidden = true;
        result.hidden = true;
        survey.hidden = false;
        showQuestion();
    });

    for (const button of survey.querySelectorAll("button")) {
        button.addEventListener("click", () => {
            if (button.value === "dislike") allowedTriggers.delete(triggers[triggerIndex].id);
            triggerIndex++;
            if (triggerIndex === triggers.length) {
                triggerIndex = 0;
                memberIndex++;
            }
            if (memberIndex === memberCount) {
                void showResults();
            } else {
                showQuestion();
            }
        });
    }
}
