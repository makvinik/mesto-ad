export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (cardData, { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick }, currentUserId) => {
    const cardElement = getTemplate();
    
    const cardImage = cardElement.querySelector(".card__image");
    const cardTitle = cardElement.querySelector(".card__title");
    const likeButton = cardElement.querySelector(".card__like-button");
    const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
    const infoButton = cardElement.querySelector(".card__control-button_type_info");
    const likeCounter = cardElement.querySelector(".card__like-count");
    
    cardImage.src = cardData.link;
    cardImage.alt = cardData.name;
    cardTitle.textContent = cardData.name;
    
    if (likeCounter) {
      likeCounter.textContent = cardData.likes.length;
    }
    
    const isLiked = cardData.likes.some(like => like._id === currentUserId);
    if (isLiked) {
      likeButton.classList.add('card__like-button_is-active');
    }
    
    if (cardData.owner && cardData.owner._id !== currentUserId) {
      deleteButton.style.display = 'none';
    }
    
    cardImage.addEventListener('click', () => onPreviewPicture({name: cardData.name, link: cardData.link}));
    likeButton.addEventListener('click', () => onLikeIcon(cardData._id, likeButton));
    deleteButton.addEventListener('click', () => onDeleteCard(cardData._id, cardElement));
    infoButton.addEventListener('click', () => onInfoClick(cardData._id));
    
    return cardElement;
};