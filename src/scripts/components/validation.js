```отображает сообщение об ошибке под невалидным полем и добавляет соответствующие классы```
function showInputError(formElement, inputElement, errorMessage, settings) {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);

};

```скрывает сообщение об ошибке и удаляет классы, связанные с ошибкой```
function hideInputError(formElement, inputElement, settings) {
    const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
    inputElement.classList.remove(settings.inputErrorClass);
    errorElement.classList.remove(settings.errorClass);
    errorElement.textContent('');

};

```проверяет валидность конкретного поля. Если оно невалидно, вызывает showInputError, иначе — hideInputError. В случае, если в поля «Имя» или «Название» введён любой символ, кроме латинской буквы, кириллической буквы и дефиса, выводит кастомное сообщение об ошибке: «Разрешены только латинские, кириллические буквы, знаки дефиса и пробелы». Текст ошибки разместить в data-* атрибуте поля ввода.```
function checkInputValidity(formElement, inputElement, settings) {
    if (inputElement.validity.patternMismatch) {
        const customError = inputElement.dataset.errorMessage;
        inputElement.setCustomValidity(customError);
    } 
    else {
        inputElement.setCustomValidity("");
    }

    if (!inputElement.validity.valid) {
        showInputError(formElement, inputElement, inputElement.validationMessage, settings);
    }
    else {
        hideInputError(formElement, inputElement, settings);
    }
};

```возвращает значение true, если хотя бы одно поле формы не прошло валидацию.```
function hasInvalidInput(inputList) {
    return inputList.some((inputElement) => !inputElement.validity.valid);
};

```делает кнопку формы неактивной```
function disableSubmitButton(buttonElement, settings) {
    buttonElement.classList.add(settings.inactiveButtonClass);
    buttonElement.disabled = true;
};

```включает кнопку формы```
function enableSubmitButton(buttonElement, settings) {
    buttonElement.classList.remove(settings.inactiveButtonClass);
    buttonElement.disabled = false;
};

```включает или отключает кнопку формы в зависимости от валидности всех полей. 
Если хотя бы одно из полей не прошло валидацию, кнопка формы должна быть неактивной. 
Если оба поля прошли — активной.```
function toggleButtonState(inputList, buttonElement, settings) {
    if (hasInvalidInput(inputList)) {
    disableSubmitButton(buttonElement, settings);
  } else {
    enableSubmitButton(buttonElement, settings);
  }
};


```добавляет обработчики события input для всех полей формы. 
При каждом вводе проверяет валидность поля и вызывает функцию toggleButtonState.```
function setEventListeners(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);
    toggleButtonState(inputList, buttonElement, settings);

    inputList.forEach((inputElement) => {
    inputElement.addEventListener('input', function () {
      checkInputValidity(formElement, inputElement, settings);
      toggleButtonState(inputList, buttonElement, settings);
    });
  });
};


```очищает ошибки валидации формы и делает кнопку неактивной.
Принимает DOM-элемент формы и объект с настройками. Используйте эту функцию при открытии формы редактирования профиля.```
function clearValidation(formElement, settings) {
    const inputList = Array.from(formElement.querySelectorAll(settings.inputSelector));
    const buttonElement = formElement.querySelector(settings.submitButtonSelector);
    inputList.forEach((inputElement) => {
    hideInputError(formElement, inputElement, settings);
    });
  
    disableSubmitButton(buttonElement, settings);
};


```отвечает за включение валидации всех форм. 
Функция должна принимать все нужные функциям селекторы элементов как объект настроек.```
function enableValidation(settings) {
    const formList = Array.from(document.querySelectorAll(settings.formSelector));
  
    formList.forEach((formElement) => {
        formElement.addEventListener('submit', (evt) => {
        evt.preventDefault();
        });
    
        setEventListeners(formElement, settings);
    });
};

export { enableValidation, clearValidation };