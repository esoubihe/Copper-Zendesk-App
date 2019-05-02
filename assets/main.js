$(function() {
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '400px' });
    getProfile(client);
});

  function getProfile(client) {
    var RESOURCE_NOT_FOUND = 'Resource not found';

    client.get('ticket').then(function(data) {
      email = data.ticket.requester.email;
      var settings = {
        url: 'https://api.prosperworks.com/developer_api/v1/people/fetch_by_email',
        headers: {
            "X-PW-AccessToken": 'd25e356381a5496eb45f58a3944bc55c',
            "X-PW-Application": 'developer_api',
            "X-PW-UserEmail": 'rostogiorgi@gmail.com',
            "Content-Type": 'application/json'
          },
        data: JSON.stringify({email: email}),
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
  
  function showAddCustomer(email, client) {
    var context = {
      email,
    };
  }


  function showError(response) {
    var context = {
      'status': response.status,
      'statusText': response.statusText
    };
    switchTo('error-hdbs', context);
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