/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define([
    'jquery',
    'apps/navbar/menu/view/abstract_list',
    'soy!jive.nitro.reputationMenu.menuContent'
], function($, AbstractListView, menuContentTmpl) {
    return AbstractListView.extend(function(protect, _super) {
        
        this.init = function(options) {
            this.options = options;
            
            _super.init.call(this, options.buttonSelector, options.menuSelector);
            
            $("#reputation-spacer").show().animate({
                width: '80'
            },{
                duration: 1000,
                complete: function() {
                    $("#reputation-spacer").remove();
                    $("#reputation-menu-link").show();
                }
            });
        };
        
        this.showReputationPoints = function(data) {
            var text = this.addCommas(data.unit.units) + ' '+this.options.i18n.pointsText.toLowerCase();
            
            this.$button.attr('title', text);
            this.$button.removeClass('reputation-points-loading').addClass('reputation-points-ready').html(text);
        };
        
        this.render = function(data) {
            var el = $(jive.nitro.reputationMenu.menuContent().toString());
            
            el.html(data);
            
            this.setContent(el);
        };
        
        protect.addCommas = function(value) {
            return value.toString().replace(/\B(?=(?:\d{3})+(?!\d))/g, ",");
        };

    });
});
