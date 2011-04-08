#Jquery mixpanel

A jquery plugin to wrap the [default mixpanel javascript utilities](http://mixpanel.com/api/docs/guides/integration/js)

##Usage

     $('.misc-links').mixpanel({ 
         event: 'click',
         mixpanel_data: { 
                event: "my-event", 
                properties: { 
                    "something":'about' 
                    ,"something callable": function(e){$(e).text()} 
                } 
         } 
         ,token: "YOUR-TOKEN" 
         ,callback: function(element){ 
            window.location = $(element).attr("href"); 
         } 
     }); 


* `event`: for which DOM event you which to bind the reporting to (defaults to `'click')`
* `mixpanel_data`: the [data expected by mixpanel](http://mixpanel.com/api/docs/specification)
* `token`: your mixpanel token
* `callback`: a function to execute after sending the asynchronous report; defaults to redirecting the `href`
   attribute of the element (as in a click in a hyperlink)

Note that the `properties` object in the `mixpanel_data` can contain functions; these functions will be passed the
current DOM element as parameter when reporting, to let you extract things like text or surrounding information.
This way you can bind this to multiple elements and still be able to access each one individually
when reporting the event.
