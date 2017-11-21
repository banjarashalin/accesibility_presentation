/*
 * Copyright (C) 1999-2015 Jive Software. All rights reserved.
 *
 * This software is the proprietary information of Jive Software. Use is subject to license terms.
 */

define([
    'jquery',
    'apps/shared/views/abstract_view',
    'jiverscripts/conc/observable',
    'soy!jive.nitro.reputationMenu.menuLink'
], function($, AbstractView, observable, menuLinkTmpl) {
    return AbstractView.extend(function(protect, _super) {
        
        observable(this);
        
        this.init = function(options) {
            this.options = options;

            $('#j-satNav-wrap > li:first').append(menuLinkTmpl());
            this.emit('viewReady');
            
        };
    });
});
