var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Shot;
(function (Shot) {
    var App = (function () {
        function App() {
            $(document).on('dragstart', 'img', function (e) {
                e.preventDefault();
            });

            switch (SHOT.controller) {
                case 'Admin':
                    new AjaxUpload.Form($('#files'), $('.thumbnail-grid'));

                    break;
                case 'Album':
                    new Album.Carousel($('.carousel'), SHOT.images);

                    break;
            }
        }
        return App;
    })();
    Shot.App = App;

    var AjaxUpload;
    (function (AjaxUpload) {
        var fileTypes = [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp'
        ];

        var Form = (function () {
            function Form(input, thumbnailGrid) {
                this.input = input;
                this.thumbnailGrid = thumbnailGrid;
                this.files = [];
                this.thumbnailQueue = [];
                var self = this;

                input.change(function () {
                    $.each(this.files, function () {
                        var image;

                        if (this.name && $.inArray(this.type, fileTypes) !== -1) {
                            image = new Image(this, self.thumbnailGrid);

                            self.files.push(image);
                            self.thumbnailQueue.push(image);
                        }
                    });

                    self.nextThumbnail();
                });
            }
            Form.prototype.nextThumbnail = function () {
                var _this = this;
                if (this.thumbnailQueue.length) {
                    this.thumbnailQueue.shift().createThumbnail(function () {
                        return _this.nextThumbnail();
                    });
                }

                return this;
            };
            return Form;
        })();
        AjaxUpload.Form = Form;

        var File = (function () {
            function File(file, thumbnailGrid) {
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                var self = this, formData = new FormData();

                formData.append('image', file);

                this.thumbnail = $('<li><div class="container"><div class="processing"/><div class="title-wrap"><div class="title"/></div></div></li>');

                this.thumbnail.find('.title').text(file.name);

                this.progressBar = new ProgressBar(this.thumbnail);

                thumbnailGrid.prepend(this.thumbnail);

                $.ajax({
                    url: SHOT.rootPath + 'upload',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    cache: false,
                    xhr: function () {
                        var xhr = $.ajaxSettings.xhr();

                        if (xhr.upload) {
                            xhr.upload.addEventListener('progress', function (e) {
                                if (e.lengthComputable) {
                                    self.progressBar.set((e.loaded / e.total) * 100);
                                }
                            }, false);
                        }

                        return xhr;
                    }
                }, 'json').done(function (data) {
                    self.progressBar.set(100, function () {
                        var image = $('<img/>');

                        image.hide().on('load', function () {
                            self.thumbnail.find('.temporary').fadeOut('fast', function () {
                                $(this).remove();
                            });

                            self.thumbnail.find('.processing').fadeOut('fast');

                            $(this).fadeIn('fast');
                        }).prependTo(self.thumbnail.find('.container')).prop('src', SHOT.rootPath + 'photos/thumb/smart/' + data.filename);
                    });
                }).fail(function (e) {
                    self.progressBar.set(0);

                    self.thumbnail.find('.container').addClass('error');

                    console.log('fail');
                });
            }
            return File;
        })();

        var Image = (function (_super) {
            __extends(Image, _super);
            function Image(file, thumbnailGrid) {
                _super.call(this, file, thumbnailGrid);
                this.file = file;
                this.thumbnailGrid = thumbnailGrid;
                this.thumbnailSize = 480;

                return this;
            }
            Image.prototype.createThumbnail = function (callback) {
                var self = this, reader = new FileReader();

                callback = typeof callback === 'function' ? callback : function () {
                };

                reader.onload = function (e) {
                    var image = $('<img/>');

                    image.on('load', function () {
                        var canvas = $('<canvas/>').get(0), size = {
                            x: this.width < this.height ? self.thumbnailSize : this.width * self.thumbnailSize / this.height,
                            y: this.height < this.width ? self.thumbnailSize : this.height * self.thumbnailSize / this.width
                        };

                        canvas.width = self.thumbnailSize;
                        canvas.height = self.thumbnailSize;

                        canvas.getContext('2d').drawImage(this, (canvas.width - size.x) / 2, (canvas.height - size.y) / 2, size.x, size.y);

                        $(canvas).css({ opacity: 0 }).animate({ opacity: .5 }, 'fast').addClass('temporary').prependTo(self.thumbnail.find('.container'));

                        callback();
                    });

                    image.on('error', function () {
                        return callback();
                    });

                    image.prop('src', e.target.result);
                };

                reader.onerror = function () {
                    return callback();
                };

                reader.readAsDataURL(this.file);

                return this;
            };
            return Image;
        })(File);

        var ProgressBar = (function () {
            function ProgressBar(thumbnail) {
                this.thumbnail = thumbnail;
                var wrap = $('<div class="progressbar-wrap"/>');

                this.el = $('<div class="progressbar"/>');

                wrap.append(this.el);

                thumbnail.find('.container').append(wrap);
            }
            ProgressBar.prototype.set = function (percentage, callback) {
                var self = this;

                this.el.stop(true, true).animate({ width: percentage + '%' }, 200, function () {
                    if (percentage === 100) {
                        self.el.fadeOut('fast');
                    }

                    if (typeof callback === 'function') {
                        callback();
                    }
                });

                return this;
            };
            return ProgressBar;
        })();
    })(AjaxUpload || (AjaxUpload = {}));

    var Album;
    (function (Album) {
        var Carousel = (function () {
            function Carousel(carousel, imagesData) {
                this.carousel = carousel;
                this.index = 0;
                this.images = [];
                var self = this, dragStart = { x: 0, y: 0 }, offset = 0, wrap = $('<div class="wrap"/>'), cutOff = $(window).width() / 2;

                $.each(['previous', 'current', 'next'], function () {
                    wrap.append('<div class="' + this + '"><a class="image"><div class="valign"/></a></div>');
                });

                wrap.appendTo(carousel);

                $(carousel).swipe(function (e, swipe) {
                    var opacity, destination, distance, duration;

                    if (e === 'start') {
                        offset = wrap.position().left;

                        carousel.addClass('animating');
                    }

                    if (e === 'move') {
                        wrap.css({ opacity: (cutOff - Math.min(cutOff, Math.abs(swipe.x))) / cutOff, left: offset - Math.min(cutOff, Math.max(-cutOff, swipe.x)) });
                    }

                    if (e === 'end') {
                        if (swipe.distance < 50 || swipe.speed < cutOff) {
                            wrap.stop().animate({ opacity: 1, left: '-100%' }, 'normal', 'easeOutQuad', function () {
                                carousel.removeClass('animating');
                            });
                        } else {
                            destination = offset + (swipe.direction === 'right' ? cutOff : -cutOff);
                            distance = Math.abs(destination - wrap.position().left);
                            duration = distance / swipe.speed * 1000;

                            wrap.animate({ opacity: 0, left: destination }, duration, 'easeOutQuad', function () {
                                wrap.css({ left: '-100%' }).animate({ opacity: 1 }, 'normal', 'easeInQuad');

                                self.index += swipe.direction === 'right' ? -1 : 1;

                                self.render();

                                carousel.removeClass('animating');
                            });
                        }
                    }
                });

                $.each(imagesData, function () {
                    self.images.push(new Image(this));
                });

                this.render();
            }
            Carousel.prototype.render = function () {
                var previous, current, next;

                this.carousel.find('.image img').remove();

                current = this.images[this.index];

                current.setSize(2048);

                this.carousel.find('.current .image').append(current.image);

                if (this.index > 0) {
                    previous = this.images[this.index - 1];

                    previous.setSize(2048);

                    this.carousel.find('.previous .image').append(previous.image);
                }

                if (this.images.length > this.index + 1) {
                    next = this.images[this.index + 1];

                    next.setSize(2048);

                    this.carousel.find('.next .image').append(next.image);
                }
            };
            return Carousel;
        })();
        Album.Carousel = Carousel;

        var Image = (function () {
            function Image(data) {
                this.data = data;
                var self = this, resizeTimeout;
                ;

                this.image = $('<img/>');

                this.image.on('load', function () {
                    $(window).on('resize', function () {
                        clearTimeout(resizeTimeout);

                        resizeTimeout = setTimeout(function () {
                            return self.onWindowResize();
                        }, 10);
                    }).trigger('resize');
                });
            }
            Image.prototype.setSize = function (size) {
                this.image.prop('src', this.data.paths[size] ? this.data.paths[size] : this.data.paths['original']);
            };

            Image.prototype.onWindowResize = function () {
            };
            return Image;
        })();
    })(Album || (Album = {}));
})(Shot || (Shot = {}));

$(function () {
    SHOT.app = new Shot.App();
});
