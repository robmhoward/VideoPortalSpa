
var rows;
var isSearched = false;

function navigateToRedirect(pickedurl) {
	window.location = redirect_uri + "?picked_url=" + pickedurl;
}

var redirect_uri = getParameterByName("redirect_uri");

var Choice = function(title, url, description, logo) {
    this.title = title;
    this.url = url;
    this.description = description;
    this.logo = logo;
    this.onclick = "navigateToRedirect('" + url + "');";
}
 
var viewModel = {
    choices: ko.observableArray()
};

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function runSearch() {
	if (isSearched) {
		createChoicesFromRows();
	}
	viewModel.choices.remove(function(item) { return item.title.toLowerCase().indexOf(searchBox.value.toLowerCase()) < 0 });
	isSearched = true;
}

function createChoicesFromRows() {
	viewModel.choices.removeAll();
	for (var i = 0; i < rows.length; i++) {
		viewModel.choices.push(createChoiceFromRow(rows[i]));
	}
}

function addTextHint(elem, hintText)
{       
    if (elem.value == '')   
    {       
        elem.value = hintText;
        elem.className = 'ghost';
    }

    elem.onfocus = function ()
    {           
        if (elem.value == hintText)         
        {
            elem.value = '';
            elem.className = 'normal';
        }
    }

    elem.onblur = function ()
    {
        if (elem.value == '')
        {
            elem.value = hintText;
            elem.className = 'ghost';
        }
    }           
}
