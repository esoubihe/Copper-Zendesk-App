// varants
var CURRENT_TICKET_AUTHOR = '@copper-zendesk/add_customer_initial_data';

var COPPER_API_HEADERS = { 
  "X-PW-AccessToken": 'd25e356381a5496eb45f58a3944bc55c',
  "X-PW-Application": 'developer_api',
  "X-PW-UserEmail": 'rostogiorgi@gmail.com',
  "Content-Type": 'application/json'
}

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
  var RESOURCE_NOT_FOUND = 'Resource not found';
  switchTo('loading');
  client.get('ticket').then(function(data) {
    var email = data.ticket.requester.email;
    var name = data.ticket.requester.name;
    safeLocalstorageSetItem(CURRENT_TICKET_AUTHOR, { email, name });
    var settings = {
      url: 'https://api.prosperworks.com/developer_api/v1/people/fetch_by_email',
      headers: COPPER_API_HEADERS,
      data: JSON.stringify({ email }),
      type: 'POST',
      dataType: 'json'
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
  getProfile();
}


// Modal code 
function openAddCustomerModal() {
  client.invoke('instances.create', {
    location: 'modal',
    url: 'assets/iframe.html',
    size: {
      width: '50vw',
      height: '60vh'
    }
  }).then(function(modalContext) {
    var modalClient = client.instance(modalContext['instances.create'][0].instanceGuid);
    modalClient.on('modal.save', function() {
      switchTo('loading');
      getProfile();
    })
  });

}



function getInputValue(elements, key) {
  if (elements[key]) {
    return elements[key].value;
  }
  return null;
}


function successPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(123);
    }, 2000)
  })
}

function createNewCopperUserObject(data) {
  var newUserObject = {};
  newUserObject.name = data.name;
  newUserObject.emails = [{ email: data.email }];
  newUserObject.company_name = data.company;
  newUserObject.title = data.title;
  newUserObject.owner = data.owner;
  // newUserObject.address = data.address;
  newUserObject.phoneNumbers = [{
    number: data.phoneNumber,
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
    company: getInputValue(elements, 'company'),
    title: getInputValue(elements, 'title'),
    owner: getInputValue(elements, 'owner'),
    address: getInputValue(elements, 'address'),
    phoneNumber: getInputValue(elements, 'phoneNumber'),
  };
  var newCopperUserObject = createNewCopperUserObject(formData);
  var settings = {
    url: 'https://api.prosperworks.com/developer_api/v1/people',
    headers: COPPER_API_HEADERS,
    data: JSON.stringify(newCopperUserObject),
    secure: false,
    type: 'POST',
    dataType: 'json'
  };
  var button = document.querySelector('button[type="submit"]');
  if (button) {
    button.classList.add('disabled', 'loading');
  }
  client.request(settings).then(function(data) {
    console.log(data);
    if(button) {
      button.classList.remove('disabled', 'loading');
    }
    client.trigger('modal.save');
    client.invoke('destroy')
  },
  function(response) {
    if(button) {
      button.classList.remove('disabled', 'loading');
    }
    console.log(response);
  })
}

function addCustomeFormValidation() {
  return {};
}

function getCurrentTicketAuthor() {
  var currentTicketAuthor;
  try {
    currentTicketAuthor = JSON.parse(localStorage.getItem(CURRENT_TICKET_AUTHOR));
  } catch(err) {}
  return currentTicketAuthor;
}

function initAddCustomerModal() {
  switchTo('loading');
  var currentTicketAuthor = getCurrentTicketAuthor();
  switchTo('add-customer-modal', currentTicketAuthor)
  var formElement = $('#add-customer-form');
  if (formElement) {
    formElement.form(addCustomeFormValidation);
    formElement.on('submit', onAddCustomerSubmit);
  }
}
