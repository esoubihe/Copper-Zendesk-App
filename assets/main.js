$(function() {
    var client = ZAFClient.init();
    client.invoke('resize', { width: '100%', height: '400px' });
    getProfile(client);  
});
  
  function getProfile(client) {
    var settings = {
      url: 'https://api.prosperworks.com/developer_api/v1/people/fetch_by_email',
      headers: {
          "X-PW-AccessToken": '60f746ba5ee0055026815883ded69657',
          "X-PW-Application": 'developer_api',
          "X-PW-UserEmail": 'eduardo@maxihost.com.br',
          "Content-Type": 'application/json'
        },
      data: JSON.stringify({email: 'behic.uzel@medianova.com'}),
      secure: false,
      type: 'POST',
      dataType: 'json'
    };
    client.request(settings).then(
      function(data) {
        showTaskData(data);
      },
      function(response) {
        showError(response);
      }
    );
  }
  
  function showTaskData(tasks) {
    switchTo('tasks-hdbs', tasks);
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