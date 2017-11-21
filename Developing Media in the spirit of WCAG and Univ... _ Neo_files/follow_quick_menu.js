define([
    'jquery',
    'underscore',
    'url',
    'application/base_view',
    'application/config',
    ], function($, _, url, View, config) {
    'use strict';
    
    return View.extend({
        init: function() {
            this.followed = this.$el.hasClass('.j-followed');
        },
        events: {
            "change .js-action-follow input": "followObject",
            "change .js-action-follow-stream input": "followStream"
        },
        updateState: function() {
            this.render();
        },
        render: function() {
            this.followed = this.firstFollow || this.$el.find('.js-action-follow-stream input:checked').length > 0;
            this.$el.toggleClass('j-followed', this.followed);
            if (!this.followed) {
                this.$el.find('input').attr('checked', false).data('checked', false);
            }

            if (this.firstFollow) {
                this.firstFollow = false;
            }

            var popover = this.$el.getPopoverInstance();
            if (popover) {
                popover.resizePopover();
            }

        },
        followObject: function(ev) {
            var self = this,
                $target = $(ev.currentTarget),
                streamId = $target.val(),
                followed = $target.data('checked');

            ev.preventDefault();
            $target.data('checked', !followed);

            if (!followed) {
                this.firstFollow = true;
                this.$el.find('#stream_' + streamId).trigger('click');
                return;
            }

            $.ajax({
                type: "DELETE",
                url: url.v2Url('/stream-config/' + self.options.type + "/" + self.options.id)
            }).then(function removeAllSuccess() {
                self.$el.find('input').attr('checked', false);
                self.render();
            });
        },
        followStream: function(ev) {
            var self = this,
                $target = $(ev.currentTarget),
                streamId = $target.val(),
                followed = $target.data('checked'),
                suffix = followed ? "/objects/remove" : "/objects";

            $target.data('checked', !followed);

            $.ajax({
                type: "POST",
                url: url.v2Url('/stream-config/' + streamId + suffix),
                contentType: "application/json",
                data: JSON.stringify([{
                    objectID: self.options.id,
                    objectType: self.options.type
                }]),
                dataType: 'json'
            });

            if (!followed) {
                $target.data('checked', true);
            }

            ev.preventDefault();
            this.render();
        }
    }); 
});
