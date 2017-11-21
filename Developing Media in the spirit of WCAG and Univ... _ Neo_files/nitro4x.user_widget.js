/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

/*jshint multistr:true */
define([
    'jquery',
    'hbs!./templates/user_widget'
], function($, userWidgetTmpl){
    // ReputationHTMLBuilder: in charge of building the HTML segments for the reputation tab
    return function(){
        
        var self = this; // maintaining reference to the original this

        // defaults for the template
        this.defaults = {
            pointCategory: "Points"
        };

        // object constructor
        this.init = function() {
            // compile the template only once when constructing the object
            self.template_user_widget = userWidgetTmpl;
        };

        this.add_comma = function(el){
            $(".nitro4x_add_comma", el).each(function(i,e){
                $(e).html($(e).text().toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ","));
            });
        };

        this.draw_user_widget = function(jsonData) {
            jsonData.unit.remaining = jsonData.next_level.units_next_to_go;
            jsonData.next_level.percentage = 100 - (jsonData.next_level.units_next_to_go / (jsonData.next_level.units_next - jsonData.level.units)).toFixed(2) * 100;

            var templateInputs = $.extend({}, self.defaults, jsonData);
            var result = $(self.template_user_widget(jsonData));

            self.add_comma(result);

            return result;
        };

        self.init(); // call object constructor
    };
});

