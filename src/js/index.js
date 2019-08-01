import "normalize.css";
import "./../sass/styles.scss";
import Swal from "sweetalert2";
let arrayOfUsers = [];
let loginBtn = document.querySelector(".js-login-btn");
let btnBold = document.querySelector(".btn-bold");
let btnItalick = document.querySelector(".btn-italick");
let btnUnderline = document.querySelector(".btn-underline");
let btnSend = document.querySelector(".btn-send");
let registrationBtn = document.querySelector(".js-registration-btn");
let formBlock = document.querySelector(".login-form");
let loginForm = document.querySelector(".js-login-form");
let onlineUsersCount = document.querySelector(".members__count");
let userList = document.querySelector(".members__list");
let messageBlock = document.querySelector(".message__block");
let textArea = document.querySelector(".form__area");
let userId = null;

btnSend.addEventListener("click", sendFunction);
btnUnderline.addEventListener("click", underlineFunction);
btnBold.addEventListener("click", boldFunction);
btnItalick.addEventListener("click", italicFunction);
textArea.addEventListener("input", symbolCountr);
loginForm.addEventListener("submit", checkUsersLogin);
registrationBtn.addEventListener("click", userRegistration);
// messageBlock.addEventListener("scroll", scrollbottom);

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
        userId = isAvaliable.user_id;
        let onlineTime = document.querySelector(".time__hours_online");
        let startTime = new Date().getTime();
        setInterval(() => {
          let curent = Date.now();
          let deltaTime = curent - startTime;

          updateClockface(onlineTime, deltaTime);
        }, 100);
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
      let date;
      data.forEach(element => {
        if (element.chatroom_id == chatId) {
          if (date + 86400000 >= Date.parse(element.datetime)) {
            let node = createMessage(element);
            chatMessages.appendChild(node);
          } else {
            date = Date.parse(element.datetime);
            let time = document.createElement("div");
            time.classList.add("time-divider");
            let dateTime = new Date(date);
            console.log();
            let year = dateTime.getFullYear();
            let month = dateTime.getMonth() + 1;
            let day = dateTime.getDate();
            time.innerHTML = `${day}.${month}.${year}`;
            let node = createMessage(element);
            chatMessages.appendChild(time);
            chatMessages.appendChild(node);
          }

          console.log(element.datetime);
        }
      });
      scrollbottom();
    });
};

//Create message
const createMessage = element => {
  let message = document.createElement("div");
  message.classList.add("message", "message__internal");
  let messageText = document.createElement("p");
  messageText.classList.add("message__text", "message__text_internal");
  messageText.innerHTML = element.message;
  // let toolTip = document.createElement("div");
  // toolTip.classList.add("tool-tip", "tool-tip_internal");
  let usersName = document.createElement("p");
  usersName.classList.add("user-name");
  usersName.innerHTML = findName(element.user_id);
  let messageTime = document.createElement("span");
  messageTime.classList.add("message__send-time", "message__send-time_internal");
  let date = new Date(Date.parse(element.datetime));
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let seconds = date.getSeconds();
  messageTime.innerHTML = `${day}.${month}.${year} - ${hours}:${seconds}`;
  message.append(usersName, messageText, messageTime);

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
      arrayOfUsers = users;
    } else {
      console.log(request.status);
    }
  };
  request.onerror = function() {
    alert("Oooops,something went wrong please try again later");
  };
  request.send();
};

function scrollbottom() {
  messageBlock.scrollTop = messageBlock.scrollHeight - messageBlock.clientHeight;
}

function symbolCountr(e) {
  let textMessage = textArea.textContent;
  let totalSymbols = document.querySelector(".total_symbols");
  let totalLetter = document.querySelector(".total_letters");
  let totalInvSymbols = document.querySelector(".total_inv-symbols");
  let totalMarks = document.querySelector(".total_marks");

  if (textMessage.length < 501) {
    totalSymbols.innerHTML = textMessage.length;
    if (textMessage.match(/[a-z]/gi)) {
      totalLetter.innerHTML = textMessage.match(/[a-z]/gi).length;
    } else {
      totalLetter.innerHTML = "0";
    }

    totalInvSymbols.innerHTML = textMessage.split(" ").length - 1 || [].length;
    if (textMessage.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g)) {
      totalMarks.innerHTML = textMessage.match(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g).length;
    } else {
      totalMarks.innerHTML = "0";
    }
  }
}

function boldFunction() {
  document.execCommand("bold", false, null);
}
function italicFunction() {
  document.execCommand("italic", false, null);
}

function underlineFunction() {
  document.execCommand("underline", false, null);
}

function sendFunction() {
  let datenow = new Date();
  let user = {};
  user.datetime = datenow.toISOString();
  user.message = textArea.innerHTML;
  user.user_id = userId;
  // console.log(user);
  fetch("https://studentschat.herokuapp.com/messages", {
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
    .then(data => console.log(data));
}

function findName(id) {
  let name = arrayOfUsers.find(elem => elem.user_id == id);
  return name.username;
}

document.addEventListener("DOMContentLoaded", function() {
  setInterval(() => {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    let chatHours = document.querySelector(".curent__hours");
    let chatMinutes = document.querySelector(".curent__minutes");

    chatHours.innerHTML = hours;
    chatMinutes.innerHTML = minutes;
  }, 1000);
});

function updateClockface(elem, time) {
  elem.textContent = getFormattedTime(time);
}
function getFormattedTime(time) {
  let data = new Date(time);
  // let milisec = parseInt(data.getMilliseconds() / 100);
  let min = data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes();
  let sec = data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds();
  return `${min}:${sec}`;
}
