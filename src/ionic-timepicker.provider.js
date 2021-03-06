var onMouseDownHandler, onMouseUpHandler, domElement;

angular.module('ionic-timepicker.provider', [])

    .directive('touchEventsHandler', function () {
        return {
            link: function (scope, element) {
                element.on('touchstart', onMouseDownHandler);
                element.on('touchend', onMouseUpHandler)
                domElement = element;
            }
        }
    })
    .provider('ionicTimePicker', function () {

        var config = {
            setLabel: 'Set',
            closeLabel: 'Close',
            inputTime: (((new Date()).getHours() * 60 * 60) + ((new Date()).getMinutes() * 60)),
            format: 12,
            step: 15,
            disabled: true
        };

        this.configTimePicker = function (inputObj) {
            angular.extend(config, inputObj);
        };

        this.$get = ['$rootScope', '$ionicPopup', '$interval', '$timeout', function ($rootScope, $ionicPopup, $interval, $timeout) {

            var intervalPromise;
            var timeoutPromise;
            var provider = {};
            var isTouchDownPersist = false;
            $scope = $rootScope.$new();
            $scope.today = resetHMSM(new Date()).getTime();
            $scope.time = {};

            //Reset the hours, minutes, seconds and milli seconds
            function resetHMSM(currentDate) {
                currentDate.setHours(0);
                currentDate.setMinutes(0);
                currentDate.setSeconds(0);
                currentDate.setMilliseconds(0);
                return currentDate;
            }

            onMouseDownHandler = function (event) {
                isTouchDownPersist = true;
                var functionToInvoke;
                if (event.target.classList.contains('increase')) {
                    functionToInvoke = event.target.classList.contains('hours') ? increaseHours : increaseMinutes;
                } else {
                    functionToInvoke = event.target.classList.contains('hours') ? decreaseHours : decreaseMinutes;
                }

                if (intervalPromise) {
                    $interval.cancel(intervalPromise);
                }

                if (timeoutPromise) {
                    $timeout.cancel(timeoutPromise);
                }

                functionToInvoke();
                $scope.$apply();
                timeoutPromise = $timeout(function () {
                    intervalPromise = $interval(function () {
                        if (isTouchDownPersist) {
                            functionToInvoke();
                        } else {
                            cancelInterval();
                            cancelTimeout();
                        }
                    }, 150)
                }, 400);
            }

            onMouseUpHandler = function () {
                isTouchDownPersist = false;
                cancelInterval();
                cancelTimeout();
            }

            cancelInterval = function () {
                $interval.cancel(intervalPromise);
                intervalPromise = null;
            }

            cancelTimeout = function () {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = null;
            }


            //Increasing the hours
            var increaseHours = function () {
                if ($scope.buttons[1].type === 'disabled-btn') {
                    $scope.buttons[1].type = 'button_set'
                }
                $scope.time.hours = Number($scope.time.hours);
                if ($scope.mainObj.format == 12) {
                    if ($scope.time.hours != 12) {
                        $scope.time.hours += 1;
                    } else {
                        $scope.time.hours = 1;
                    }
                }
                if ($scope.mainObj.format == 24) {
                    $scope.time.hours = ($scope.time.hours + 1) % 24;
                }
                $scope.time.hours = ($scope.time.hours < 10) ? ('0' + $scope.time.hours) : $scope.time.hours;
            };

            //Decreasing the hours
            var decreaseHours = function () {
                if ($scope.buttons[1].type === 'disabled-btn') {
                    $scope.buttons[1].type = 'button_set'
                }
                $scope.time.hours = Number($scope.time.hours);
                if ($scope.mainObj.format == 12) {
                    if ($scope.time.hours > 1) {
                        $scope.time.hours -= 1;
                    } else {
                        $scope.time.hours = 12;
                    }
                }
                if ($scope.mainObj.format == 24) {
                    $scope.time.hours = ($scope.time.hours + 23) % 24;
                }
                $scope.time.hours = ($scope.time.hours < 10) ? ('0' + $scope.time.hours) : $scope.time.hours;
            };

            //Increasing the minutes
            var increaseMinutes = function () {
                if ($scope.buttons[1].type === 'disabled-btn') {
                    $scope.buttons[1].type = 'button_set'
                }
                $scope.time.minutes = Number($scope.time.minutes);
                $scope.time.minutes = ($scope.time.minutes + $scope.mainObj.step) % 60;
                $scope.time.minutes = ($scope.time.minutes < 10) ? ('0' + $scope.time.minutes) : $scope.time.minutes;
            };

            //Decreasing the minutes
            var decreaseMinutes = function () {
                if ($scope.buttons[1].type === 'disabled-btn') {
                    $scope.buttons[1].type = 'button_set'
                }
                $scope.time.minutes = Number($scope.time.minutes);
                $scope.time.minutes = ($scope.time.minutes + (60 - $scope.mainObj.step)) % 60;
                $scope.time.minutes = ($scope.time.minutes < 10) ? ('0' + $scope.time.minutes) : $scope.time.minutes;
            };

            //Changing the meridian
            $scope.changeMeridian = function () {
                $scope.time.meridian = ($scope.time.meridian === "AM") ? "PM" : "AM";
            };

            function setMinSecs(ipTime, format) {
                $scope.time.hours = Math.floor(ipTime / (60 * 60));

                var rem = ipTime % (60 * 60);
                if (format == 12) {
                    if ($scope.time.hours >= 12) {
                        $scope.time.meridian = 'PM';

                        if ($scope.time.hours > 12) {
                            $scope.time.hours -= 12;
                        }
                    } else {
                        $scope.time.meridian = 'AM';
                    }
                    if ($scope.time.hours === 0) {
                        $scope.time.hours = 12;
                    }
                }

                $scope.time.minutes = rem / 60;

                $scope.time.hours = Math.floor($scope.time.hours);
                $scope.time.minutes = Math.floor($scope.time.minutes);

                if ($scope.time.hours.toString().length == 1) {
                    $scope.time.hours = '0' + $scope.time.hours;
                }
                if ($scope.time.minutes.toString().length == 1) {
                    $scope.time.minutes = '0' + $scope.time.minutes;
                }
                $scope.time.format = $scope.mainObj.format;
            }

            $scope.keyDownHandler = function (event, type) {
                $timeout(function () {
                    if ($scope.time.hours === '' || $scope.time.minutes === '') {
                        $scope.buttons[1].type = 'disabled-btn';
                        return;
                    }

                    if ($scope.time.hours.length > 2) {
                        $scope.time.hours = $scope.time.hours.substr(0, 2);
                        return;
                    }
                    if ($scope.time.minutes.length > 2) {
                        $scope.time.minutes = $scope.time.minutes.substr(0, 2);
                        return;
                    }

                    if (type === 'hours') {
                        if ($scope.time.format === 12 ? +$scope.time.hours > 12 : +$scope.time.hours >= 24) {
                            $scope.time.hours = '00';
                        }
                    } else {
                        if (+$scope.time.minutes < 0 || +$scope.time.minutes > 59) {
                            $scope.time.minutes = '00';
                        }
                    }
                    $scope.buttons[1].type = 'button_set';
                }, 50);
            }

            provider.openTimePicker = function (ipObj) {
                $scope.buttons = [];
                $scope.mainObj = angular.extend({}, config, ipObj);
                setMinSecs($scope.mainObj.inputTime, $scope.mainObj.format);

                $scope.buttons.push({
                    text: $scope.mainObj.closeLabel,
                    type: 'button_close',
                    onTap: function (e) {
                        domElement.unbind();
                    }
                });

                $scope.buttons.push({
                    text: $scope.mainObj.setLabel,
                    type: 'button_set',
                    onTap: function (e) {
                        var totalSec = 0;

                        if ($scope.time.format == 12) {
                            $scope.time.hours = Number($scope.time.hours);
                            if ($scope.time.meridian == 'PM' && $scope.time.hours != 12) {
                                $scope.time.hours += 12;
                            } else if ($scope.time.meridian == 'AM' && $scope.time.hours == 12) {
                                $scope.time.hours -= 12;
                            }
                            totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                        } else {
                            totalSec = ($scope.time.hours * 60 * 60) + ($scope.time.minutes * 60);
                        }
                        domElement.unbind();
                        $scope.mainObj.callback(totalSec);
                    }
                });

                $scope.popup = $ionicPopup.show({
                    templateUrl: 'ionic-timepicker.html',
                    scope: $scope,
                    cssClass: 'ionic_timepicker_popup',
                    buttons: $scope.buttons
                });

            };

            return provider;

        }];

    });