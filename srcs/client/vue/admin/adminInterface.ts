import { isAuthenticated } from "./authenticator";
import { userupdate } from "./userupdate";
import { friendPage } from "./friend";
import { adminOnlyPage } from "./AdminPage";

export function handleEnter(button: HTMLButtonElement) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      button.click();
    }
  };
}

export async function adminPage(header: string, footer: string) {
  const app = document.getElementById("app");

  if (!app) return;

  try
  {
    const auth = await isAuthenticated();
		const id = auth.authenticated ? auth.id : 0;

    const resuser = await fetch("/api/getuser", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    const dataadmin = await resuser.json();

    if (!resuser.ok) {
      alert(dataadmin.error || "Erreur lors de la création");
      return;
    }
    const admin = dataadmin.admin;

    const currentHref = location.hash.slice(1);
    const subHref = currentHref.split('#');
    const subHeader = `
      <section class="sub-header">
        <div class="header_links">
          <a class="header_link" href="#${subHref[0]}#user">user</a>
          <a class="header_link" href="#${subHref[0]}#friend">friend</a>
          ${admin == true
            ? `<a class="header_link" href="#${subHref[0]}#admin">admin</a>`
            : ``
          }
        </div>
      </section>
    `;

    app.innerHTML = `
        ${header}
        ${subHeader}
      `;

    if (!subHref[1] || subHref[1] === "user")
    {
      userupdate(app.innerHTML, footer);
    }
    else if (subHref[1] === "admin")
    {
      if (admin == true)
      {
        adminOnlyPage(app.innerHTML, footer);
      }
      else
      {
        alert("you need to be amin");
      }
    }
    else
    {
      friendPage(app.innerHTML, footer);
    }
  } catch (err) {
    console.error(err);
  }
}
