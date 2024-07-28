/* Handles dynamically loaded content, mainly the online count and event list */
document.addEventListener("DOMContentLoaded", function(event) {
    updateMemberCount();
    updateEventList();
    updateStaffList();
});

async function updateMemberCount() {
    const response = await fetch("https://api.heeler.house/members");
    const data = await response.json();

    document.getElementById("members_all").innerText = data.all;
    document.getElementById("members_online").innerText = data.online;
}

async function updateEventList() {
    const response = await fetch("https://api.heeler.house/events");
    const data = await response.json();

    if (data.length == 0) {
      let noEventText = document.createElement("span");
      noEventText.classList.add("text-muted", "lead");
      noEventText.innerText = "No events are scheduled.";

      document.getElementById("ongoingEvents").appendChild(noEventText);
    }

    for (let i = 0; i < data.length; i++) {
        let event = data[i];
        console.log(event);

        let title = document.createElement("h3");
        title.classList.add("blueyfont");
        title.innerText = event.name;

        let time = document.createElement("h6");
        time.classList.add("blueyfont");

        if (event.ongoing) {
            time.classList.add("text-success");
            time.innerText = "Ongoing!";
        } else {
            event.start = new Date(event.start);
            time.innerText = `${event.start.getDate()}${getDateSuffix(event.start.getDate())} of ${getMonthName(event.start.getMonth())} ${event.start.getFullYear()} at ${timeTo12(event.start.getHours(), event.start.getMinutes())}`;
        }

        let description = document.createElement("p");
        description.classList.add("mb-4", "overflow-auto");
        description.innerText = event.description || "No description was provided.";

        let leftSide = document.createElement("div");
        leftSide.classList.add(event.image == null ? "col-lg-12" : "col-lg-7");
        leftSide.appendChild(title);
        leftSide.appendChild(time);
        leftSide.appendChild(description);

        let color = "secondary";
        if (i % 2 == 0) color = "primary";

        let container = document.createElement("div");
        container.classList.add("container", "row", "text-start", "border", `border-${color}-subtle`, "border-3", `bg-${color}-subtle`, "rounded-4", "p-3", "text-lg-start", "text-center", "my-2", "m-auto");
        container.appendChild(leftSide);

        if (event.image != null) {
            let bannerImage = document.createElement("img");
            bannerImage.classList.add("col-lg-5", "p-0", "m-0", "align-self-end", "rounded-3", "align-self-center");
            bannerImage.src = `${event.image}?size=512`;

            container.appendChild(bannerImage);
        }

        document.getElementById("ongoingEvents").appendChild(container);
    }
}

async function updateStaffList() {
    const response = await fetch("https://api.heeler.house/staff");
    const data = await response.json();
    const bioData = await (await fetch("/staffMembers.json")).json();

    document.getElementById("staff-count-word").innerText = numberToWord(data.leadership.length + data.mods.length + data.helpers.length);

    for (let roleName in data) {
        data[roleName] = data[roleName].filter(member => !bioData.ignoredStaff.includes(member.id));
        for (let i = 0; i < data[roleName].length; i++) {
            let avatar = document.createElement("img");
            avatar.classList.add("avatar", "shadow-sm");
            avatar.alt = `${data[roleName][i].name}'s avatar`;
            avatar.src = data[roleName][i].avatar;

            let avatarContainer = document.createElement("div");
            avatarContainer.classList.add((data[roleName].length - 1) == i && i % 2 == 0 ? "col-xl-12" : "col-xl-2", "d-flex", "justify-content-center", "align-self-center");
            avatarContainer.appendChild(avatar);

            let name = document.createElement("h4");
            name.innerText = data[roleName][i].name;

            let pronouns = document.createElement("h6");
            pronouns.innerText = bioData[data[roleName][i].id] != undefined ? bioData[data[roleName][i].id].pronouns || "Unknown, ask." : "Unknown, ask.";

            let bio = document.createElement("p");
            bio.innerText = bioData[data[roleName][i].id] != undefined ? bioData[data[roleName][i].id].bio || "No bio provided." : "No bio provided.";

            let dataContainer = document.createElement("div");
            dataContainer.classList.add((data[roleName].length - 1) == i && i % 2 == 0 ? "col-xl-12" : "col-xl-10", "align-self-center");
            dataContainer.appendChild(name);
            dataContainer.appendChild(pronouns);
            dataContainer.appendChild(bio);

            let designContainer = document.createElement("div");
            designContainer.classList.add("border-3", "shadow-sm", "rounded-3", `bg-${roleName}-subtle`, `border-${roleName}-subtle`, "row", "p-2", "d-flex");
            designContainer.appendChild(avatarContainer);
            designContainer.appendChild(dataContainer);

            let container = document.createElement("div");
            container.classList.add((data[roleName].length - 1) == i && i % 2 == 0 ? "col-lg-12" : "col-lg-6" );
            container.appendChild(designContainer);

            document.getElementById(`${roleName}List`).appendChild(container);
        }
    }
}

// Util functions

function numberToWord(number) {
  const numberToWord = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen"];
  const tensWord = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];

  if (number <= 13) {
    return numberToWord[number];
  } else if (number <= 19) {
    return `${numberToWord[number % 10]}teen`;
  } else {
    // higher than 13.
    let tens = Math.floor(number / 10);
    let units = number % 10;

    return `${tensWord[tens]} ${numberToWord[units]}`;
  }
}

function getDateSuffix(date) {
    if ((date.toString().endsWith("1")) && (!date.toString().endsWith("11"))) return "st";
    if ((date.toString().endsWith("2")) && (!date.toString().endsWith("12"))) return "nd";
    if ((date.toString().endsWith("2")) && (!date.toString().endsWith("13"))) return "rd";
    return "th";
  }

  function getMonthName(month) {
    return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][month];
  }

  function fullDigits(number) {
    return String(number).padStart(2, "0")
  }

  function timeTo12(hours, minutes) {
    if (hours / 12 > 1) {
      return `${hours-12}${minutes != 0 ? `:${fullDigits(minutes)}` : ``}pm`;
    } else {
      if (hours == 0) hours = 12;
      return `${hours}${minutes != 0 ? `:${fullDigits(minutes)}` : ``}am`;
    }
  }