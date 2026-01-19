export class EventEmitter {
    constructor() {
        this.callbacks = {};
        this.namespaceCallbacks = {};
    }

    on(_names, callback) {
        // Errors
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong names');
            return false;
        }

        if (typeof callback === 'undefined') {
            console.warn('wrong callback');
            return false;
        }

        // Resolve names
        const names = this.resolveNames(_names);

        // Each name
        names.forEach((_name) => {
            // Resolve name
            const name = this.resolveName(_name);

            // Create namespace if not exist
            if (!(this.namespaceCallbacks[name.namespace] instanceof Object))
                this.namespaceCallbacks[name.namespace] = {};

            // Create callback if not exist
            if (!(this.namespaceCallbacks[name.namespace][name.value] instanceof Array))
                this.namespaceCallbacks[name.namespace][name.value] = [];

            // Add callback
            this.namespaceCallbacks[name.namespace][name.value].push(callback);
        });

        return this;
    }

    off(_names) {
        // Errors
        if (typeof _names === 'undefined' || _names === '') {
            console.warn('wrong names');
            return false;
        }

        // Resolve names
        const names = this.resolveNames(_names);

        // Each name
        names.forEach((_name) => {
            // Resolve name
            const name = this.resolveName(_name);

            // Remove namespace
            if (name.namespace !== 'base' && name.value === '') {
                delete this.namespaceCallbacks[name.namespace];
            }

            // Remove specific callback in namespace
            else if (name.namespace !== 'base') {
                if (this.namespaceCallbacks[name.namespace] instanceof Object && this.namespaceCallbacks[name.namespace][name.value] instanceof Array) {
                    delete this.namespaceCallbacks[name.namespace][name.value];

                    // Remove namespace if empty
                    if (Object.keys(this.namespaceCallbacks[name.namespace]).length === 0)
                        delete this.namespaceCallbacks[name.namespace];
                }
            }

            // Remove specific callback in base namespace
            else if (this.namespaceCallbacks.base instanceof Object && this.namespaceCallbacks.base[name.value] instanceof Array) {
                delete this.namespaceCallbacks.base[name.value];

                // Remove base namespace if empty
                if (Object.keys(this.namespaceCallbacks.base).length === 0)
                    delete this.namespaceCallbacks.base;
            }
        });

        return this;
    }

    trigger(_name, _args) {
        // Errors
        if (typeof _name === 'undefined' || _name === '') {
            console.warn('wrong name');
            return false;
        }

        let finalResult = null;
        let result = null;

        // Default args
        const args = !(_args instanceof Array) ? [] : _args;

        // Resolve names (should on have one event)
        let name = this.resolveNames(_name);

        // Resolve name
        name = this.resolveName(name[0]);

        // Default namespace
        if (name.namespace === 'base') {
            // Try to find callback in each namespace
            for (const namespace in this.namespaceCallbacks) {
                if (this.namespaceCallbacks[namespace] instanceof Object && this.namespaceCallbacks[namespace][name.value] instanceof Array) {
                    this.namespaceCallbacks[namespace][name.value].forEach(function (callback) {
                        result = callback.apply(this, args);

                        if (typeof finalResult === 'undefined') {
                            finalResult = result;
                        }
                    });
                }
            }
        }

        // Specified namespace
        else if (this.namespaceCallbacks[name.namespace] instanceof Object) {
            if (name.value === '') {
                console.warn('wrong name');
                return false;
            }

            this.namespaceCallbacks[name.namespace][name.value].forEach(function (callback) {
                result = callback.apply(this, args);

                if (typeof finalResult === 'undefined')
                    finalResult = result;
            });
        }

        return finalResult;
    }

    resolveNames(_names) {
        let names = _names;
        names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '');
        names = names.replace(/[,/]+/g, ' ');
        names = names.split(' ');

        return names;
    }

    resolveName(name) {
        const newName = {};
        const parts = name.split('.');

        newName.original = name;
        newName.value = parts[0];
        newName.namespace = 'base'; // Base namespace

        if (parts.length > 1 && parts[1] !== '') {
            newName.namespace = parts[1];
        }

        return newName;
    }
}
