import {MDCDataTable} from '@material/data-table';
import {MDCDialog} from '@material/dialog';
import {MDCSelect} from '@material/select';
import {MDCTextField} from '@material/textfield';
import {MDCLinearProgress} from '@material/linear-progress';

const dataTable = new MDCDataTable(document.querySelector('.mdc-data-table'));
const createDialog = new MDCDialog(document.getElementById('create-dialog'));
const downloadDialog = new MDCDialog(document.getElementById('download-dialog'));
const select = new MDCSelect(document.querySelector('.mdc-select'));
const name = new MDCTextField(document.getElementById('name-field-mdc'));
const version = new MDCTextField(document.getElementById('version-field-mdc'));
const softwareId = new MDCTextField(document.getElementById('id-field-mdc'));
const linearProgress = new MDCLinearProgress(document.querySelector('.mdc-linear-progress'));

const createButton = document.getElementById('create-update-button');

createButton.addEventListener('click', () => {
    createDialog.open();
});

createDialog.listen('MDCDialog:closing', (event) => {
    console.log(event);
    if (event.detail.action === "accept") {
        console.log('User accepted');
        $.ajax({
            url: "/admin/release",
            type: "POST",
            dataType: "json",
            data: {name: name.value, version: version.value, platform: select.value, id: softwareId.value},
            success(result) {
                const json = JSON.parse(result);
                addData(json);
            },
            error(error) {
                console.log(error);
            }
        });
    }
});

$.ajax({
    type: "GET",
    url: "/admin/release",
    success(result) {
        const json = JSON.parse(result);
        json.forEach(function (release) {
            addData(release);
        });
    }
});

function addData(json) {
    $('tbody').append('<tr class="mdc-data-table__row" id="' + json._id + '">' +
        '<td class="mdc-data-table__cell mdc-data-table__cell--checkbox">' +
        '<div class="mdc-checkbox mdc-data-table__row-checkbox">' +
        '<input class="mdc-checkbox__native-control" type="checkbox">' +
        '<div class="mdc-checkbox__background">' +
        '<svg class="mdc-checkbox__checkmark" viewbox="0 0 24 24">' +
        '<path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59">' +
        '<div class="mdc-checkbox__mixedmark">' +
        '<td class="mdc-data-table__cell">' + json.name + '</td>' +
        '<td class="mdc-data-table__cell">' + json.major + '.' + json.minor + '.' + json.patch + '</td>' +
        '<td class="mdc-data-table__cell">' + new Date(json.pubDate).toLocaleDateString() + '</td>' +
        '<td class="mdc-data-table__cell">' + json.platform + '</td>' +
        '<td class="mdc-data-table__cell">' + json.notes + '</td>' +
        // '<td class="mdc-data-table__cell">' + json.downloads + '</td>' +
        '<td class="mdc-data-table__cell">' +
        '<button class="mdc-icon-button material-icons">edit</button>' +
        '<button class="mdc-icon-button material-icons" onclick="document.getElementById(\'' + json._id + '-upload\').click()">cloud_upload</button>' +
        '<button class="mdc-icon-button material-icons" id="remove-' + json._id + '">delete</button>' +
        '<input type="file" hidden id="' + json._id + '-upload"></td>' +
        '</div>' +
        '</path>' +
        '</svg>' +
        '</div>' +
        '</div>' +
        '</td>' +
        '</tr>');
    dataTable.layout();
    $('#' + json._id + '-upload').change(function () {
        const file = $(this)[0].files[0];
        if (file) {
            linearProgress.progress = 0;
            downloadDialog.open();
            const upload = new Upload(file);
            upload.doUpload(json._id);
            $(this).val('');
        }
    });
    $('#remove-' + json._id).click(function () {
        $.ajax({
            type: 'POST',
            url: '/admin/release/' + json._id + '/delete',
            data: {},
            success: function () {
                console.log('Deleted ' + json._id);
                dataTable.getRows().forEach(function (value) {
                    if (value.id === json._id) {
                        value.remove();
                    }
                });
            }
        })
    })
}

const Upload = function (file) {
    this.file = file;
};
Upload.prototype.getName = function () {
    return this.file.name;
};
Upload.prototype.doUpload = function (id) {
    const that = this;
    const formData = new FormData();

    formData.append("file", this.file, this.getName());
    formData.append("upload_file", true);

    $.ajax({
        type: "POST",
        url: `/admin/release/${id}/file`,
        xhr: function () {
            const myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function (data) {
            downloadDialog.close();
        },
        error: function (error) {
            downloadDialog.close();
            console.error(error);
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 30000
    });
};

Upload.prototype.progressHandling = function (event) {
    let percent = 0;
    const position = event.loaded || event.position;
    const total = event.total;
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    linearProgress.progress = percent / 100.0;
};