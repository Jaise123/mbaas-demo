(function($) {
  $(function() {
    // Custom Select
    $("select[name='herolist']").selectpicker({style: 'btn-primary', menuStyle: 'dropdown-inverse'});
    app.events();
    app.doAct({
      act : 'params'
    }, function(err, res){
      if (err){
        return alert(err.msg);
      }
      app.params = res;
      for (var key in res){
        if (res.hasOwnProperty(key)){
          $('#connectorList').append('<option>' + key + '</option>');
        }
      }
    });
  });
  
})(jQuery);

var app = {
   events : function(){
      $('#emailShow').on('click', this.showPopup);
      $('#smsShow').on('click', this.showPopup);
      $('#dbShow').on('click', this.showPopup);
     $('#connectorsShow').on('click', this.showPopup);
      $('#dataShow').on('click', this.showPopup);
     $('#dbShow').on('click', this.showPopup);
      $('#modalScreen').on('click', this.hidePopup)
      $('.actionLink').on('click', this.doAction);
      $('#showDataLink').on('click', this.showData);
      $('#showDbLink').on('click', this.showDb);
      $('#connectorList').on('change', this.setConnectorBody);
      $('#connectorsSend').on('click', this.connectorsLink);
      $('#connectorsCancel').on('click', this.hidePopup);

   },
   hidePopup : function(){
     $('#modalScreen').hide();
     $('.popup').hide();
   },
   showPopup : function(){
      window.scrollTo(0,0);
      $('input, select, textarea').val(""); // replace any previous content

      var id = this.id,
      popupId = id.replace("Show", "Popup");

      $('.popup').hide();
      $('#' + popupId).show();
      $('#modalScreen').show();
      if (app.hasOwnProperty(popupId)){
        app[popupId].call(app, []);
      }
   },
   doAction : function(e){
     var id = this.id;
     if (app.hasOwnProperty(id)){
       app[id].call(app, e);
     }
     app.hidePopup();
   },
   emailLink : function(){
     app.doAct({
      act : 'sendgrid',
      to : $('input[type=email]').val(),
      body : $('#emailBody').val()
     }, function(err, res){
        if (err){
          alert(err.msg);
        }
     });
   },
   connectorsLink : function(e){
    var req = JSON.parse($('#connectorJSON').val());
    req.act = $('#connectorList').val();
    app.doAct(req, function(err, res){
      if (err){
        alert('Error!\n' + JSON.stringify(err));
      }
      alert(JSON.stringify(res));
    });
   },
   setConnectorBody : function(){
    var name = $(this).val(),
    params = app.params[name];
     $('#connectorJSON').val(JSON.stringify(params));
   },
   smsLink : function(){
     app.doAct({
       act : 'twillio',
       to : $('select').val() + $('input[type=number]').val(),
       body : $('#smsBody').val()
     }, function(err, res){
       if (err){
         alert(err.msg);
       }
       if (res.ok){
         alert("Message sent!");
       }
     });
   },
   insertLink : function(){
     var self = this,
     field;
     try{
       field = JSON.parse($('#dbObject').val());
     }catch(err){
      return alert('Improper JSON');
     }

     app.doAct({
       act : 'db',
       operation : 'create',
       type : 'mbaas',
       fields : field
     }, function(err, res){
        if (err){
          return alert('Error creating field');
        }
        alert('Field created successfully');
     });
   },
   dataPopup : function(){
    var self = this;
    app.doAct({
      act : 's3',
      req : {
        bucket : 'cianstestbucket'
      }
    }, function(err, res){
      if (err){
        alert(err.err);
        return;
      }
      var data = res.contents;
      self.s3 = data;

      $('#s3List').empty();
      for (var i=0; i<data.length; i++){
        var d = data[i];
        $('#s3List').append('<li data-index="' + i + '">' + d.Key + '</li>');
      }

      $('#s3List li').on('click', function(){
        var index = $(this).attr('data-index');
        var bucket = self.s3[parseInt(index)];
        $fh.webview({
          'act': 'open',
          'url': 'https://s3.amazonaws.com/cianstestbucket/' + bucket.Key,
          'title': 'S3 File'
        }, function(res) {
          if (res === "opened") {
            //webview window is now open
          }
          if (res === "closed") {
            //webview window is now closed
          }
        }, function(msg, err) {

        });


      });

    });
   },

   dbPopup : function(){
     app.doAct({
       act : 'db',
       operation : 'list',
       type : 'mbaas'
     }, function(err, data){
       if (err){
         alert(err.err);
         return;
       }

       $('#dbList').empty();
       var entries = data.list;
       for (var i=0; i<entries.length; i++){
         var d = entries[i];
         $('#dbList').append('<li>' + JSON.stringify(d.fields) + '</li>');
       }

     });
   },
   doAct : function(req, cb){
      $fh.act({
        act : req.act,
        req : req
      }, function(res){
        return cb(null, res);
      }, function(err){
        return cb(err);
      })
   }
};