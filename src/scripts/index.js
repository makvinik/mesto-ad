/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/
import { 
  getCardList, 
  getUserInfo, 
  setUserInfo, 
  updateAvatar, 
  addNewCard, 
  deleteCardFromServer,
  likeCardOnServer,
  unlikeCardOnServer 
} from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

let isSaving = false;

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings); 

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  if (isSaving) return;
  
  const submitButton = profileForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  isSaving = true;
  
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      isSaving = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  
  if (isSaving) return;
  
  const submitButton = avatarForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;
  isSaving = true;
  
  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при обновлении аватара:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      isSaving = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  if (isSaving) return;
  
  const submitButton = cardForm.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;
  isSaving = true;
  
  addNewCard(cardNameInput.value, cardLinkInput.value)
    .then((newCardData) => {
      placesWrap.prepend(
        createCardElement(
          newCardData, 
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
          },
          currentUserId
        )
      );
      cardForm.reset();
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при создании карточки:', err);
    })
    .finally(() => {
      submitButton.textContent = originalText;
      submitButton.disabled = false;
      isSaving = false;
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  if (isSaving) return;
  
  if (confirm('Вы уверены, что хотите удалить карточку?')) {
    isSaving = true;
    
    deleteCardFromServer(cardId)
      .then(() => {
        cardElement.remove();
      })
      .catch((err) => {
        console.log('Ошибка при удалении карточки:', err);
      })
      .finally(() => {
        isSaving = false;
      });
  }
};

const handleLikeCard = (cardId, likeButton) => {
  const isLiked = likeButton.classList.contains('card__like-button_is-active');
  
  if (isLiked) {
    unlikeCardOnServer(cardId)
      .then((updatedCard) => {
        likeButton.classList.remove('card__like-button_is-active');
        const likeCounter = likeButton.closest('.card').querySelector('.card__like-counter');
        if (likeCounter) {
          likeCounter.textContent = updatedCard.likes.length;
        }
      })
      .catch(err => console.log('Ошибка при снятии лайка:', err));
  } else {
    likeCardOnServer(cardId)
      .then((updatedCard) => {
        likeButton.classList.add('card__like-button_is-active');
        const likeCounter = likeButton.closest('.card').querySelector('.card__like-counter');
        if (likeCounter) {
          likeCounter.textContent = updatedCard.likes.length;
        }
      })
      .catch(err => console.log('Ошибка при постановке лайка:', err));
  }
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (label, value) => {
  const template = document.querySelector('#popup-info-definition-template').content;
  const element = template.querySelector('.popup__info-item').cloneNode(true);
  
  element.querySelector('.popup__info-term').textContent = label;
  element.querySelector('.popup__info-description').textContent = value;
  
  return element;
};

const createUserPreview = (user) => {
  const template = document.querySelector('#popup-info-user-preview-template').content;
  const element = template.querySelector('.popup__list-item').cloneNode(true);
  
  element.querySelector('.popup-info__user-avatar').src = user.avatar;
  element.querySelector('.popup-info__user-avatar').alt = user.name;
  element.querySelector('.popup-info__user-name').textContent = user.name;
  
  return element;
};


const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find(card => card._id === cardId);
      
      if (!cardData) return;
      
      const infoList = document.querySelector('.popup__info');
      const usersList = document.querySelector('.popup__list');
      
      infoList.innerHTML = '';
      usersList.innerHTML = '';
      
      infoList.append(
        createInfoString('Название', cardData.name),
        createInfoString('Автор', cardData.owner.name),
        createInfoString('Дата создания', formatDate(new Date(cardData.createdAt)))
      );
      
      if (cardData.likes.length === 0) {
        usersList.innerHTML = '<p class="popup-info__no-likes">Пока никто не лайкнул</p>';
      } else {
        cardData.likes.forEach(user => {
          usersList.append(createUserPreview(user));
        });
      }
      
      const infoModal = document.querySelector('.popup_type_info');
      openModalWindow(infoModal);
    })
    .catch((err) => {
      console.log('Ошибка при загрузке информации о карточке:', err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  clearValidation(profileForm, validationSettings);
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();

  clearValidation(avatarForm, validationSettings);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();

  clearValidation(cardForm, validationSettings);
  openModalWindow(cardFormModalWindow);
});


const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});


Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    const currentUserId = userData._id;
    
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData, 
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
          },
          currentUserId
        )
      );
    });
  })