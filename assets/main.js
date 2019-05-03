// constants
var CURRENT_TICKET_AUTHOR = '@copper-zendesk/add_customer_initial_data';

var COPPER_HEADER = { 
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
  
  client.get('ticket').then(function(data) {
    var email = data.ticket.requester.email;
    var name = data.ticket.requester.name;
    safeLocalstorageSetItem(CURRENT_TICKET_AUTHOR, { email, name });
    var settings = {
      url: 'https://api.prosperworks.com/developer_api/v1/people/fetch_by_email',
      headers: COPPER_HEADER,
      data: JSON.stringify({ email }),
      secure: false,
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
    modalClient.on('modal.close', function() {
      
    });
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

function onAddCustomerSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const elements = form.elements;
  const firstName = getInputValue(elements, 'firstName');
  const lastName =  getInputValue(elements, 'lastName');
  const email = getInputValue(elements, 'email');
  const company = getInputValue(elements, 'company');
  const title = getInputValue(elements, 'title');
  const owner = getInputValue(elements, 'owner');
  const address = getInputValue(elements, 'address');
  const phoneNumber = getInputValue(elements, 'phoneNumber');
  const data = {
    email,
    firstName,
    lastName,
    company,
    title,
    owner,
    address,
    phoneNumber
  };
  var settings = {
    url: 'https://api.prosperworks.com/developer_api/v1/people',
    headers: COPPER_HEADER,
    data: JSON.stringify(data),
    secure: false,
    type: 'POST',
    dataType: 'json'
  };
  const button = document.querySelector('button[type="submit"]');
  if (button) {
    button.classList.add('disabled', 'loading');
  }
  successPromise().then(function(data) {
    console.log(data);
    if(button) {
      button.classList.remove('disabled', 'loading');
    }
    client.invoke('destroy');
  },
  function(response) {
    console.log(response);
  })
}

function initAddCustomerModal() {
  var currentTicketAuthor = JSON.parse(localStorage.getItem(CURRENT_TICKET_AUTHOR));
  switchTo('add-customer-modal', currentTicketAuthor)
  const form = document.querySelector('#add-customer-form');
  if (form) {
    form.addEventListener('submit', onAddCustomerSubmit)
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

