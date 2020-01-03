import {MDCTextField} from '@material/textfield';
import {MDCTextFieldHelperText} from '@material/textfield/helper-text';
import {MDCDialog} from '@material/dialog';
import {MDCLinearProgress} from '@material/linear-progress';

const usernameEl = document.getElementById('mdc-username');
const passwordEl = document.getElementById('mdc-password');
const usernameValEl = document.querySelector('.vusername');
const passwordValEl = document.querySelector('.vpassword');

const loginButton = document.getElementById('login-button');
const textFieldUsername = new MDCTextField(usernameEl);
const textFieldPassword = new MDCTextField(passwordEl);
const validateUsername = new MDCTextFieldHelperText(usernameValEl);
const validatePassword = new MDCTextFieldHelperText(passwordValEl);
const dialog = new MDCDialog(document.getElementById('login-dialog'));
const progressbar = new MDCLinearProgress(document.querySelector('.mdc-linear-progress'));
progressbar.determinate = false;

document.getElementById('form')
    .addEventListener('submit',
        login);

function login() {
    dialog.open();
    loginButton.disabled = true;
    const username = textFieldUsername.value;
    const password = textFieldPassword.value;
    $.ajax({
        url: "/admin/login",
        type: "POST",
        data: {username: username, password: password},
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

                Notification.requestPermission().then((result) => {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('redirect')) {
                        window.location.assign(urlParams.get('redirect'));
                    } else {
                        window.location.href = '/admin/';
                    }
                });
            } else {
                console.log("Did not receive response.");
            }
        },
        error(xhr, ajaxOptions, thrownError) {
            dialog.close();
            loginButton.disabled = false;
            console.log(thrownError);
            const responseText = jQuery.parseJSON(xhr.responseText);
            console.log(responseText);
            if (responseText.username) {
                validateUsername.foundation_.setContent(responseText.message);
                textFieldUsername.valid = false;
            } else if (responseText.password) {
                validatePassword.foundation_.setContent(responseText.message);
                textFieldPassword.valid = false;
            } else {
                validateUsername.foundation_.setContent(responseText.message);
                textFieldUsername.valid = false;
            }
        }
    });
}