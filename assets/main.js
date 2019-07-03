// constants
var CURRENT_TICKET_AUTHOR = '@copper-zendesk/add_customer_initial_data';

var COPPER_API_HEADERS = { 
  "X-PW-AccessToken": '{{setting.api_key}}',
  "X-PW-Application": 'developer_api',
  "X-PW-UserEmail": '{{setting.email}}',
  "Content-Type": 'application/json'
}

// shared code
var client = ZAFClient.init();

function init(location) {
  if(location === 'modal') {
    initAddCustomerModal();
  } else {
    initTicketApp() 
  }
}

function switchTo(template_name, context) {
  var template_id = "#" + template_name;
  var source = $(template_id).html();
  var template = Handlebars.compile(source);
  if (context) {
    var html = template(context);
  } else {
    var html = template();
  }
  $("#content").html(html);
}

client.on('app.registered', function(data) {
  init(data.context.location);
});


// Ticket sidebar
function isObject (value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

function safeLocalstorageSetItem(key, item) {
  try {
    if(isObject(item)) {
      item = JSON.stringify(item);
    }
    localStorage.setItem(key, item)
  } catch(err) {}
}

function getProfile() {
  showLoading();
  var RESOURCE_NOT_FOUND = 'Resource not found';
  client.get('ticket').then(function(data) {
    var email = data.ticket.requester.email;
    var name = data.ticket.requester.name;
    safeLocalstorageSetItem(CURRENT_TICKET_AUTHOR, { email, name });
    var settings = {
      url: 'https://api.prosperworks.com/developer_api/v1/people/fetch_by_email',
      headers: COPPER_API_HEADERS,
      data: JSON.stringify({ email }),
      type: 'POST',
      dataType: 'json',
      secure: true,
    };
    client.request(settings).then(
      function(data) {
        showTaskData(data);
      },
      function(response) {
        var message = response.responseJSON.message;
        if (message === RESOURCE_NOT_FOUND) {
          showAddCustomer(email);
        } else {
          showError(response);
        }
      }
    );
  });
}

function showLoading() {
  switchTo('loading');
}

function showTaskData(tasks) {
  switchTo('tasks-hdbs', tasks);
}

function showAddCustomer() {
  switchTo('add-customer')
}

function showError(response) {
  var context = {
    'status': response.status,
    'statusText': response.statusText
  };
  switchTo('error-hdbs', context);
}

function initTicketApp() {
  client.invoke('resize', { width: '100%', height: '200px' });
  getProfile();
}

function openAddCustomerModal() {
  client.invoke('instances.create', {
    location: 'modal',
    url: 'assets/iframe.html',
    size: {
      width: '30vw',
      height: '60vh'
    }
  }).then(function(modalContext) {
    var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
    modalClient.on('modal.save', function() {
      getProfile();
    })
  });
}

// Modal code 
function showAddCustomerForm(context) {
  switchTo('add-customer-form', context)
}

function getInputValue(elements, key) {
  if (elements[key]) {
    return elements[key].value;
  }
  return null;
}

function createNewCopperUserObject(data) {
  var newUserObject = {};
  newUserObject.name = data.name;
  newUserObject.emails = [{ email: data.email }];
  newUserObject.title = data.title;
  newUserObject['assignee_id'] = data.owner;
  newUserObject.address = {
    street: data.street,
    city: data.city,
    state: data.state,
    postal_code: data.postalCode,
    country: data.country,
  };
  newUserObject['phone_numbers'] = [{
    number: data.phoneNumber,
    category: 'mobile',
  }];
  return newUserObject;
}

function onAddCustomerSubmit(event) {
  event.preventDefault();
  var form = event.target;
  var elements = form.elements;
  var formData = {
    name: getInputValue(elements, 'name'),
    email: getInputValue(elements, 'email'),
    title: getInputValue(elements, 'title'),
    owner: getInputValue(elements, 'owner'),
    street: getInputValue(elements, 'street'),
    city: getInputValue(elements, 'city'),
    state: getInputValue(elements, 'state'),
    postalCode: getInputValue(elements, 'postalCode'),
    country: getInputValue(elements, 'country'),
    phoneNumber: getInputValue(elements, 'phoneNumber'),
  };
  var newCopperUserObject = createNewCopperUserObject(formData);
  var settings = {
    url: 'https://api.prosperworks.com/developer_api/v1/people',
    headers: COPPER_API_HEADERS,
    data: JSON.stringify(newCopperUserObject),
    secure: true,
    type: 'POST',
    dataType: 'json',
  };
  var button = $('button[type="submit"]');
  if (button) {
    button.addClass('disabled loading');
  }
  client.request(settings).then(function(data) {
    if(button) {
      button.removeClass('disabled loading');
    }
    client.trigger('modal.save');
    client.invoke('destroy')
  },
  function() {
    if(button) {
      button.classList.remove('disabled', 'loading');
    }
    // TODO: handle error
  })
}

function getCurrentTicketAuthor() {
  var currentTicketAuthor;
  try {
    currentTicketAuthor = JSON.parse(localStorage.getItem(CURRENT_TICKET_AUTHOR));
  } catch(err) {}
  return currentTicketAuthor;
}


function addCustomerFormValidation() {
  // TODO: form validation
  return {};
}

function populateOwnersDropdown() {
  var dropdown = $('#owners-select');
  dropdown.dropdown({
  });
  var settings = {
    url: 'https://api.prosperworks.com/developer_api/v1/users/search',
    headers: COPPER_API_HEADERS,
    data: JSON.stringify({
      'page_size': 200,
      'sort_by': 'name',
    }),
    type: 'POST',
    secure: true,
    dataType: 'json'
  };
  client.request(settings).then(function(data) {
    $.each(data, function() {
      dropdown.append($("<option />").val(this.id).text(this.name));
    });
  }).catch(function(response) {
    // TODO: handle error
  });
}

function initAddCustomerModal() {
  showLoading();
  var currentTicketAuthor = getCurrentTicketAuthor();
  showAddCustomerForm(currentTicketAuthor);
  populateOwnersDropdown();
  var formElement = $('#add-customer-form');
  if (formElement) {
    formElement.form(addCustomerFormValidation);
    formElement.on('submit', onAddCustomerSubmit);
  }
}
