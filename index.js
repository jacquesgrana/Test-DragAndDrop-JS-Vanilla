let dragged = null;
let persons = [];
const MAX_DATAS = 10;

init();
async function init() {
  persons = await getAll();
  renderTable();
}

/*
document.getElementById("dropZone").addEventListener("drop", function (event) {
    drop(event);
});
*/

document.addEventListener("dragstart", function (event) {
  console.log("dragstart");
  dragged = event.target;
  dragged.style.opacity = 0.25;
  dragged.classList.add("dragging");
});

document.addEventListener("dragend", function (event) {
  console.log("dragend");
  if (dragged) {
    dragged.style.opacity = "";
    dragged.classList.remove("dragging");
  }
});

function allowDrop(event) {
  console.log("allowDrop");
  event.preventDefault();
}
/*
function drop(event) {
  console.log("drop");
  event.preventDefault();
  //event.stopPropagation();
  let dropTarget = event.target;

  while (dropTarget.tagName !== "TBODY") {
    dropTarget = dropTarget.parentNode;
  }

  dropTarget.style.backgroundColor = "";

  if (dropTarget.tagName === "TBODY") {
    setTimeout(function () {
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

      // Insert before the element whose top is below mouseY
      for (var i = 0; i < dropTarget.children.length; i++) {
        var childRect = dropTarget.children[i].getBoundingClientRect();
        if (childRect.top > mouseY) {
          // Check if mouseY is exactly in the middle of the row
          if (mouseY > childRect.top && mouseY < childRect.bottom) {
            dropTarget.insertBefore(dragged, dropTarget.children[i]);
            // Insert the data at the new position
            //if (dataToInsert) {
              persons.splice(i, 0, dataToInsert);
            //}
            generateRanks();
            return;
          } 
          else {
            dropTarget.insertBefore(dragged, dropTarget.children[i - 1]);
            // Insert the data at the new position
            //if (dataToInsert) {
              persons.splice(i - 1, 0, dataToInsert);
            //}
            generateRanks();
            return;
          }
        }
      }

      /*
      // If mouseY is below all elements, append the dragged element to the end
      if (mouseY > rect.bottom) {
        console.log("inserted at the end");
        dropTarget.appendChild(dragged);
        // Insert the data at the end of the datas array
        if (dataToInsert) {
          persons.push(dataToInsert);
        }
        //generateRanks();
      } else if (mouseY < rect.top) {
        // If mouseY is above all elements, insert at the beginning
        console.log("inserted at the top");
        dropTarget.insertBefore(dragged, dropTarget.firstChild);
        // Insert the data at the beginning of the datas array
        if (dataToInsert) {
          persons.unshift(dataToInsert);
        }
        //generateRanks();
      }
      generateRanks();
      *//*
      //generateRanks();
    }, 100); // 100ms delay
  }
  //console.log("drop result, datas : ", datas);
}*/

async function drop(event) {
    console.log("drop");
    event.preventDefault();
    //event.stopPropagation();
    let dropTarget = event.target;
  
    while (dropTarget.tagName !== "TBODY") {
      dropTarget = dropTarget.parentNode;
    }
  
    dropTarget.style.backgroundColor = "";
  
    if (dropTarget.tagName === "TBODY") {
      //setTimeout(async function () {
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
  
        let insertIndex = -1;
  
        // Find the index to insert in the persons array
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
        } else {
          dropTarget.insertBefore(dragged, dropTarget.children[insertIndex]);
          persons.splice(insertIndex, 0, dataToInsert);
        }
  
        await generateRanks();
        renderTable();
      //}, 100); // 100ms delay
    }
  }
  

async function generateRanks() {
  const tabHtml = document.getElementById("dropZone").children;
  //console.table(persons);
  persons = persons.filter(p => p !== undefined); // TODO a améliorer
  //console.table(persons);
  const updates = [];
  
  for (let i = 1; i <= MAX_DATAS; i++) {
    //console.log("dataset", tabHtml[i-1].dataset);
    let dataId = parseInt(tabHtml[i-1].dataset.id);
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

function renderTable() {
  console.log("renderTable");
  const tBodyElt = document.getElementById("dropZone");
  tBodyElt.innerHTML = "";
  const sortedTable = persons.slice().sort((a, b) => a.rank - b.rank);
  sortedTable
    .forEach((element) => {
        tBodyElt.innerHTML +=
        `<tr draggable="true" class="draggable" data-id="${element.id}">` +
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
        "</tr>";
    });
}
