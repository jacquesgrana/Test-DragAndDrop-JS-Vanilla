let dragged = null;
let persons = [];
let draggedHeight = 0;
//const MAX_DATAS = 10;
let datas_nb = 0;

/**
 * Fonction d'initialisation, charge le tableau 'persons' et affiche le tableau
 */
init();
async function init() {
  persons = await getAll();
  datas_nb = persons.length;
  //console.table(persons);
  /*
  persons.forEach((person) => {
    const color = `rgb(${Math.floor(Math.random() * 128 + 127)}, ${Math.floor(Math.random() * 128 + 127)}, ${Math.floor(Math.random() * 128 + 127)})`;
    person.color = color;
  })*/
  renderTable();
}


/*
document.addEventListener("dragstart", function (event) {
  console.log("dragstart");
  dragged = event.target;
  dragged.style.opacity = 0.25;
  dragged.classList.add("dragging");
  draggedHeight = dragged.getBoundingClientRect().height;
  //console.log('hauteur : ', dragged.getBoundingClientRect().height);
});
*/

/**
 * Fonction qui gère l'évènement dragstart et qui permet de déplacer l'element avec la poignée.
 * Définit la variable 'dragged' qui représente la ligne du tableau qui est déplacée
 * @param {Event} event 
 */
function handleDragStart(event) {
  console.log("dragstart");
  dragged = event.target.closest("tr"); // Trouve l'élément <tr> parent
  dragged.style.opacity = 0.25;
  //dragged.classList.add("dragging");
  draggedHeight = dragged.getBoundingClientRect().height;

  event.target.classList.add('bg-color-orange');

  // Ajoute un attribut personnalisé pour indiquer le déplacement
  dragged.setAttribute("data-dragging", "true");

  // Définir l'effet de déplacement (move)
  event.dataTransfer.effectAllowed = "move";

  // Stocker les données nécessaires pour le déplacement
  event.dataTransfer.setData("text/html", dragged.innerHTML);
  const rect = dragged.getBoundingClientRect();

  // Ajouter l'image
  event.dataTransfer.setDragImage(dragged, event.clientX - rect.left, event.clientY - rect.top)

  // Empêcher que l'événement ne soit propagé aux parents
  event.stopPropagation();
}


/**
 * Fonction qui gère l'évènement dragend, raz des styles et des attributs
 */
document.addEventListener("dragend", function (event) {
  console.log("dragend");
  if (dragged) {
    dragged.style.opacity = 1.0;
    //dragged.classList.remove("dragging");

    dragged.removeAttribute("data-dragging");
    event.target.classList.remove('bg-color-orange');
    event.target.classList.add('bg-color-grey');
  }
});

/**
 * Fonction qui autorise le drop
 * @param {Event} event 
 */
function allowDrop(event) {
  console.log("allowDrop");
  event.preventDefault();
}

/**
 * Fonction qui gère l'évènement drop.
 * Trois types de drop : en haut, en bas et dans le tableau
 * @param {*} event 
 */
async function drop(event) {
  console.log("drop");
  event.preventDefault();
  let dropTarget = event.target;

  while (dropTarget.tagName !== "TBODY") {
    dropTarget = dropTarget.parentNode;
  }

  dropTarget.style.backgroundColor = "";

  if (dropTarget.tagName === "TBODY") {
    dragged.parentNode.removeChild(dragged);
    let rect = dropTarget.getBoundingClientRect();
    let mouseY = event.clientY;

    // Find the corresponding data in the datas array
    let dataIndex = parseInt(dragged.dataset.id);
    let dataToInsert = null;
    if (dataIndex !== -1) {
      // Store the data to insert in a separate variable
      dataToInsert = persons[dataIndex];
      // Remove the data from its current position
      persons.splice(dataIndex, 1);
    }
    
    
    if (mouseY < (rect.top + draggedHeight/2)) {
      // If mouseY is above all elements, insert at the beginning
      //console.log("inserted at the top");
      dropTarget.insertBefore(dragged, dropTarget.firstChild);
      // Insert the data at the beginning of the datas array
      if (dataToInsert) {
        persons.unshift(dataToInsert);
      }
      //generateRanks();
      changeIndicator("green" ,"insertion par en haut");
    } 
    else {
      let insertIndex = -1;
      // Find the index to insert in the perxsons array
      for (var i = 0; i < dropTarget.children.length; i++) {
        var childRect = dropTarget.children[i].getBoundingClientRect();
        if (childRect.top > mouseY) {
          insertIndex = i;
          break;
        }
      }

      // If mouseY is below all elements, insert at the end
      if (insertIndex === -1) {
        dropTarget.appendChild(dragged);
        persons.push(dataToInsert);
        changeIndicator("purple" ,"insertion par le bas");
      } 
      // insertion 'courante'
      else {
        dropTarget.insertBefore(dragged, dropTarget.children[insertIndex]);
        persons.splice(insertIndex, 0, dataToInsert);
        changeIndicator("orange" ,"insertion normale");
      }
    }

    //console.log('dragged height :', dragged.getBoundingClientRect().height);

    await generateRanks();
    persons = await getAll();
    renderTable();
  }
}

/**
 * Fonction qui génère les rangs selon l'ordre des lignes tableau (au format html)
 * A la fin, appelle la fonction qui fait les requêtes de mise à jour des rangs
 */
async function generateRanks() {
  const tabHtml = document.getElementById("dropZone").children;
  //console.table(persons);
  persons = persons.filter((p) => p !== undefined); // TODO a améliorer
  //console.table(persons);
  const updates = [];

  for (let i = 1; i <= datas_nb; i++) {
    //console.log("dataset", tabHtml[i-1].dataset);
    let dataId = parseInt(tabHtml[i - 1].dataset.id);
    //console.log('dataId : ' + dataId +' / rank : ' + i);
    const id = persons.findIndex((p) => p.id === dataId);
    //console.log('id tableau :', id);
    persons[id].rank = i;

    // Ajouter la mise à jour à la liste des mises à jour
    updates.push({ id: dataId, rank: i });
  }
  const sortedDatas = persons.slice().sort((a, b) => a.rank - b.rank);
  //console.log("Datas after ranking: ", sortedDatas);
  //console.log('updates', updates);
  // Envoyer la liste des mises à jour à une fonction qui gérera la requête PATCH ultérieurement
  await applyRanksUpdates(updates);
}


/**
 * Fonction qui enleve des classes css pour le background de l'élement html
 * @param {*} element 
 */
function removeIndicatorBgColors(element) {
  const classList = element.classList;
  const bgColors = [
    "bg-color-grey",
    "bg-color-orange",
    "bg-color-purple",
    "bg-color-green",
  ];
  bgColors.forEach((bgColor) => {
    classList.remove(bgColor);
  });
}

/**
 * Fonction qui enleve des classes css pour le texte de l'élement html
 * @param {*} element 
 */
function removeIndicatorColors(element) {
  const classList = element.classList;
  const colors = [
    "color-grey",
    "color-orange",
    "color-purple",
    "color-green",
  ];
  colors.forEach((bgColor) => {
    classList.remove(bgColor);
  });
}
/**
 * Fonction qui modifie l'indicateur
 * @param {*} color 
 * @param {*} text 
 */
function changeIndicator(color, text) {
  const indicator = document.getElementById("indicator");
  const indicatorText = document.getElementById("indicator-text");
  removeIndicatorBgColors(indicator);
  removeIndicatorColors(indicatorText);
  indicator.classList.add(`bg-color-${color}`);
  indicatorText.classList.add(`color-${color}`);
  indicator.style.backgroundColor = color;
  indicatorText.textContent = text;
}

/**
 * Fonction qui affiche le tableau des personnes et met en place les listeners sur les poignées
 */
function renderTable() {
  console.log("renderTable");
  const tBodyElt = document.getElementById("dropZone");
  tBodyElt.innerHTML = "";
  const sortedTable = persons.slice().sort((a, b) => a.rank - b.rank);
  sortedTable.forEach((element) => {
    //console.log('element :', element);
    tBodyElt.innerHTML +=
      `<tr draggable="false" class="draggable" data-id="${element.id}" style="background-color: ${element.color};">` +
      "<td>" +
      element.rank +
      "</td>" +
      "<td>" +
      element.id +
      "</td>" +
      "<td>" +
      element.firstname +
      "</td>" +
      "<td>" +
      element.lastname +
      "</td>" +
      "<td>" +
      element.email +
      "</td>" +
      "<td>" +
      "<span draggable='true' class='handler' >⇳</span>" +
      "</td>" +
      "</tr>";
  });
  document.querySelectorAll(".handler").forEach(e => e.addEventListener("dragstart", handleDragStart));

}
