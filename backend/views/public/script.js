const loadPackages = async () => {
    const list = document.querySelector("#dependency-list");
    if (!list) return;

    const req = await fetch("/api/packages");
    const res = await req.json();

    if (list.innerHTML.length === 0)
        list.innerHTML = res.packages
            .map((p) => `<option value="${p.name}">${p.name}</option>`)
            .join("");
};

const handleFormSubmit = async () => {
    const form = document.querySelector("#adding-form");
    if (!form) return;

    let submitBody = {
        id: form.id.value,
        name: form.name.value,
        description: form.description.value,
        releases: form.releases.value,
    };

    const lister = document.querySelector("#dependency-lister");
    if (lister) {
        const buttons = form.querySelectorAll("button[data-id]");
        submitBody.dependencies = [...buttons]
            .map((b) => b.dataset.name)
            .join(", ");

        console.log(submitBody);

        buttons.forEach((btn) =>
            btn.addEventListener("click", (e) => {
                e.preventDefault();
                submitBody.dependencies = submitBody.dependencies
                    .split(/[, ]+/gim)
                    .filter((d) => d !== e.target.dataset.name);
                e.target.parentElement.remove();
            })
        );
    }
    if (form.dependencies) {
        submitBody.dependencies += form.dependencies.value;
    }

    form.querySelectorAll("input, textarea").forEach((input) =>
        input.addEventListener("input", async (e) => {
            e.preventDefault();
            submitBody[e.target.id] = e.target.value;

            if (lister && e.target.id === "dependencies") {
                const buttons = form.querySelectorAll("button[data-id]");
                submitBody.dependencies +=
                    ", " + [...buttons].map((b) => b.dataset.name).join(", ");
            }

            console.clear();
            console.log(JSON.stringify(submitBody, null, 2));
        })
    );

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const method = form.action.match(/\/edit\/package\/\d+/gim)
            ? "PUT"
            : "POST";

        const req = await fetch(form.action, {
            method,
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            body: JSON.stringify(submitBody),
        });
        location.reload();
    });
};

const handleDelete = () => {
    document.querySelector("#deleter").addEventListener("click", async (e) => {
        e.preventDefault();
        await fetch(e.target.href, {
            headers: { "Content-Type": "application/json" },
            mode: "cors",
            method: "DELETE",
        });
        window.location = "/";
    });
};

const main = async () => {
    loadPackages();
    handleFormSubmit();
    handleDelete();
};

main();
