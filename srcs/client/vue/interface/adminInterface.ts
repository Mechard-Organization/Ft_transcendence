import { isAuthenticated } from "./authenticator";
import { userupdate } from "./userupdate";
import { friendPage } from "./friend";

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

  const currentHref = location.hash.slice(1);
  const subHref = currentHref.split('#');
  const subHeader = `
    <section class="sub-header">
      <div class="header_links">
        <a class="header_link" href="#${subHref[0]}#user">user</a>
        <a class="header_link" href="#${subHref[0]}#friend">friend</a>
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
  else
  {
    friendPage(app.innerHTML, footer);
  }
}
