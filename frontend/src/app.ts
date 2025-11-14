/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   app.ts                                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: ajamshid <ajamshid@student.42.fr>          +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/10/15 15:05:54 by ajamshid          #+#    #+#             */
/*   Updated: 2025/11/05 18:40:22 by ajamshid         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {gamePage} from "./gameLogicAndMeshes";
import {resetBabylonJs} from "./ButtonsAndUI";

const app = document.getElementById("app");

//main function that selects the page asked
function showPage(page: string) {
  const app = document.getElementById("app");
  if (!app) return;
  resetBabylonJs();
  app.innerHTML = "";

  if (page === "home") {
    app.innerHTML = "<h1>Home</h1>";
  } else if (page === "about") {
    app.innerHTML = "<h1>About</h1>";
  } else if (page === "game") {
    gamePage();
  } else {
    app.innerHTML = "<h1>Page not found</h1>";
  }
}


// Listen for navigation
window.onhashchange = () => showPage(location.hash.slice(1));

// Initial load
showPage(location.hash.slice(1) || "home");
