import {MDCTextField} from '@material/textfield';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';

const emailEl = document.querySelector('.email');
const usernameEl = document.querySelector('.username');
const passwordEl = document.querySelector('.password');
const cPasswordEl = document.querySelector('.cpassword');
const validateEmailEl = document.querySelector('.vemail');
const validateUsernameEl = document.querySelector('.vusername');
const validatePasswordEl = document.querySelector('.vpassword');
const validateCPasswordEl = document.querySelector('.vcpassword');

const textFieldEmail = new MDCTextField(emailEl);
const textFieldUsername = new MDCTextField(usernameEl);
const textFieldPassword = new MDCTextField(passwordEl);
const textFieldCPassword = new MDCTextField(cPasswordEl);
const validationEmail = new MDCTextFieldHelperText(validateEmailEl);
const validationUsername = new MDCTextFieldHelperText(validateUsernameEl);
const validationPassword = new MDCTextFieldHelperText(validatePasswordEl);
const validationCPassword = new MDCTextFieldHelperText(validateCPasswordEl);
const validateUsername = document.getElementById('usernameVal');
const validatePassword = document.getElementById('passwordVal');
const cValidatePassword = document.getElementById('confirmPasswordVal');

document.getElementById('form')
    .addEventListener('submit',
        register);

function register() {
    if (!checkPasswords()) {
        return;
    }
    const username = textFieldUsername.value;
    const password = textFieldPassword.value;
    const email = textFieldEmail.value;
    $.ajax({
        url: "/admin/register",
        type: "POST",
        data: {username: username, email: email, password: password},
        dataType: "json",
        success(result) {
            textFieldUsername.valid = true;
            textFieldPassword.valid = true;
            if (result.session !== undefined) {
                const date = new Date();
                date.setTime(date.getTime() + 86400000);
                let cookieData = "jwt=" + result.session + "; expires=" + date.toUTCString() + "; path=/;";
                if (location.protocol === 'https:') {
                    cookieData = cookieData + " secure;"
                }
                document.cookie = cookieData;
                window.location.href = '/';
            } else {
                console.log("Did not receive response.");
            }
        },
        error(xhr, ajaxOptions, thrownError) {
            console.log(thrownError);
            const responseText = jQuery.parseJSON(xhr.responseText);
            console.log(responseText);
            if (responseText.username) {
                validateUsername.innerText = responseText.message;
                textFieldUsername.valid = false;
            } else if (responseText.password) {
                validatePassword.innerText = responseText.message;
                textFieldPassword.valid = false;
            } else {
                validateUsername.innerText = responseText.message;
                textFieldUsername.valid = false;
            }
        }
    });
}

function checkPasswords() {
    const password = textFieldPassword.value;
    const cPassword = textFieldCPassword.value;
    if (password !== cPassword) {
        textFieldPassword.valid = false;
        validatePassword.innerText = "Passwords do not match.";
        textFieldCPassword.valid = false;
        cValidatePassword.innerText = "Passwords do not match.";
        return false;
    } else {
        textFieldPassword.valid = true;
        validatePassword.innerText = "This field is required.";
        textFieldCPassword.valid = true;
        cValidatePassword.innerText = "This field is required.";
        return true;
    }
}