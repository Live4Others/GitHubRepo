(function() {
    var registeredTopics = {};

    window.amdocsEvents = {

        register: function(topicName,listener) {
            if(!registeredTopics[topicName] || !registeredTopics[topicName]._listeners) {
                registeredTopics[topicName] = {_listeners : []};
            }
            registeredTopics[topicName]._listeners.push(listener);
        },
        unregister: function(topicName,listener) {
            if(!registeredTopics[topicName] ) {
                return;
            }
            if (typeof(listener) !== "undefined"){
                for (var i=0;i < registeredTopics[topicName]._listeners.length;i++) {
                    if(registeredTopics[topicName]._listeners[i] === listener) {
                        registeredTopics[topicName]._listeners.splice(i, 1);
                        break;
                    }
                }
            }else{
                registeredTopics[topicName] = null;
            }

        },
        publish: function(topicName, attrs) {
            if(!registeredTopics[topicName]) {
                return;
            }
            var topic = {"name" : topicName, "attributes" : attrs};
            for (var i=0;i < registeredTopics[topicName]._listeners.length;i++) {
                registeredTopics[topicName]._listeners[i](topic);
            }
        }
    };
})();