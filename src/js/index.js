import "normalize.css";
import "./../sass/styles.scss";
import Swal from "sweetalert2";

let loginBtn = document.querySelector(".js-login-btn");
let registrationBtn = document.querySelector(".js-registration-btn");
let formBlock = document.querySelector(".login-form");
let loginForm = document.querySelector(".js-login-form");
let onlineUsersCount = document.querySelector(".members__count");
let userList = document.querySelector(".members__list");

loginForm.addEventListener("submit", checkUsersLogin);
registrationBtn.addEventListener("click", userRegistration);

//Chacking login in base
function checkUsersLogin(e) {
  e.preventDefault();
  let name = e.target.querySelector(".js-user-name");
  fetch("https://studentschat.herokuapp.com/users")
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`ERROR: ${response.statusText}`);
      }
    })
    .then(data => {
      let isAvaliable = data.find(elem => elem.username == name.value);
      if (isAvaliable !== undefined) {
        formBlock.classList.add("hide");
        getUsersList();
        getMassages("MAIN");
      } else {
        Swal.fire(`Error`, `No user with this login`, "error");
        document.querySelector(".js-user-name").value = "";
        // let errMessage = document.createElement("p");
        // errMessage.classList.add("login__message_error");
        // errMessage.innerHTML = "No user with this login";
        // let userNameNode = document.querySelector(".js-form-name");

        // if (!document.querySelector(".login__message_error")) {
        //   userNameNode.append(errMessage);
        // }
      }
    })
    .catch(err => console.log(err));
}

//Registration
function userRegistration() {
  let name = document.querySelector(".js-user-name");

  let user = {};
  user.username = name.value;

  fetch("https://studentschat.herokuapp.com/users/register", {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`ERROR: ${response.statusText}`);
      }
    })
    .then(data => {
      Swal.fire(`User ${data.username} successfully registered`, `User ID: ${data.id}`, "success");
      document.querySelector(".js-user-name").value = "";
    })
    .catch(err => {
      Swal.fire(`Error`, `This login is already used`, "error");
      document.querySelector(".js-user-name").value = "";
    });
}
// Get messages
const getMassages = chatId => {
  let chatMessagesList = document.querySelector(`#${chatId}`);
  // console.log(chatMessagesList);
  const URL = "https://studentschat.herokuapp.com/messages";
  fetch(URL)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`ERROR: ${response.statusText}`);
      }
    })
    .then(data => {
      let chatMessages = chatMessagesList.querySelector(".message__block");
      data.forEach(element => {
        if (element.chatroom_id == chatId) {
          let node = createMessage(element);
          chatMessages.appendChild(node);
        }
      });
    });
};

//Create message
const createMessage = element => {
  let message = document.createElement("div");
  message.classList.add("message", "message__internal");
  let messageText = document.createElement("p");
  messageText.classList.add("message__text", "message__text_internal");
  messageText.innerHTML = element.message;
  let toolTip = document.createElement("div");
  toolTip.classList.add("tool-tip", "tool-tip_internal");

  let messageTime = document.createElement("span");
  messageTime.classList.add("message__send-time", "message__send-time_internal");
  let date = new Date(Date.parse(element.datetime));
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let seconds = date.getSeconds();
  messageTime.innerHTML = `${day}.${month}.${year} - ${hours}:${seconds}`;
  message.append(messageText, toolTip, messageTime);
  return message;
};
//Get online users count
const getActiveUsers = data => {
  let activeUsersCount = 0;
  data.forEach(element => {
    if (element.status == "active") {
      activeUsersCount += 1;
    }
  });
  return activeUsersCount;
};

//Create user`s Node

const createUserNode = elem => {
  let membersBlock = document.createElement("div");
  membersBlock.classList.add("members__block");

  let member = document.createElement("div");
  member.classList.add("member");

  let memberIcon = document.createElement("div");
  memberIcon.classList.add("member__icon");
  if (elem.status == "inactive") {
    memberIcon.classList.add("inactive");
  }

  let memberImg = document.createElement("img");

  memberImg.setAttribute("src", "images/user-2-icon.png");
  memberImg.classList.add("member__img");
  let memberStatus = document.createElement("img");
  memberStatus.setAttribute("src", "images/green-circle.png");
  memberStatus.classList.add("member__status");

  let memberName = document.createElement("p");
  memberName.classList.add("member__name");
  memberName.innerHTML = elem.username;

  memberIcon.append(memberImg);
  memberIcon.append(memberStatus);

  member.appendChild(memberIcon);
  member.appendChild(memberName);
  membersBlock.appendChild(member);
  return membersBlock;
};

let getUsersList = () => {
  let request = new XMLHttpRequest();
  request.open("GET", "https://studentschat.herokuapp.com/users", true);

  request.onload = function() {
    if (request.status >= 200 && request.status < 400) {
      // Обработчик успещного ответа
      let response = request.responseText;
      let users = JSON.parse(response);
      onlineUsersCount.innerHTML = getActiveUsers(users);
      let usersArray = [];
      users.forEach(element => {
        let node = createUserNode(element);

        if (element.status !== "active") {
          usersArray.push(node);
        } else {
          usersArray.unshift(node);
        }
      });

      userList.append(...usersArray);
    } else {
      console.log(request.status);
    }
  };
  request.onerror = function() {
    alert("Oooops,something went wrong please try again later");
  };
  request.send();
};
