import {MDCDrawer} from "@material/drawer";
import {MDCTopAppBar} from "@material/top-app-bar";
import {MDCRipple} from "@material/ripple";

const drawer = MDCDrawer.attachTo(document.querySelector('.mdc-drawer'));
const topAppBar = MDCTopAppBar.attachTo(document.getElementById('app-bar'));
topAppBar.setScrollTarget(document.getElementById('main-content'));
topAppBar.listen('MDCTopAppBar:nav', () => {
    drawer.open = !drawer.open;
});

const selector = '.mdc-button, .mdc-icon-button, .mdc-card__primary-action, .mdc-list-item, .mdc-fab';
const ripples = [].map.call(document.querySelectorAll(selector), function (el) {
    return new MDCRipple(el);
});

const updatesLink = document.getElementById('updates-link');

const path = window.location.pathname.toLowerCase();
if (path === '/admin') {
    updatesLink.classList.add('mdc-list-item--activated');
}
