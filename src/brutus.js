/**
 * @author Rémy Böhler
 */

(function (doc) {
    'use strict';

    var body = doc.body;
    var obfuscatedContainerClassName = 'obfuscated-content';
    var obfuscatedClassName = 'obfuscated';

    /**
     * @param {Array|Object} array
     * @param {Function} callback
     * @param {Object} [scope]
     */
    var each = function (array, callback, scope) {
        for (var key in array) {
            if (array.hasOwnProperty(key)) {
                callback.call(scope, array[key], key);
            }
        }
    };

    /**
     * @param {NodeList|Array} elements
     * @param {Function} callback
     */
    var mapTextNodes = function (elements, callback) {
        each(elements, function (element) {
            if (element.classList.contains(obfuscatedClassName)) {
                element.classList.remove(obfuscatedClassName)
            }

            each(element.childNodes, function (node) {
                var tag = node.nodeName;

                if (tag === '#text') {
                    callback(node);
                } else if (tag !== 'A') {
                    // ignore A tags because they are not obfuscated
                    mapTextNodes([node], callback);
                }
            });
        });
    };

    /**
     * @param {String} char
     * @returns {Boolean}
     */
    var isWhitespaceChar = function (char) {
        return char === ' ' || char === '\t' || char === '\n' || char === '\r';
    };

    /**
     * @param {Text} textNode
     */
    var decrypt = function (textNode) {
        // caesar offset
        var offset = -1;

        var result = '';
        each(textNode.wholeText, function (char) {
            if (!isWhitespaceChar(char)) {
                char = String.fromCharCode(char.charCodeAt(0) + offset);
            }

            result += char;
        });

        textNode.textContent = result;
    };

    /**
     * @param {Node} element
     */
    var removeElement = function (element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    };

    /**
     * @param {NodeList} elements
     */
    var removeElements = function (elements) {
        each(elements, removeElement);
    };

    // reverse text obfuscation
    each(body.querySelectorAll('.' + obfuscatedContainerClassName), function (container) {
        // remove class
        container.classList.remove(obfuscatedContainerClassName);

        // decrypt content
        mapTextNodes(container.querySelectorAll('.' + obfuscatedClassName), decrypt);

        // find and remove popup
        var parent = container.parentNode;

        // remove classes to remove blur filter
        parent.className = '';

        // remove popup
        removeElement(parent.nextSibling);
    });

    // remove elements
    removeElement(doc.getElementById('laterpay-replacement'));
    removeElements(body.querySelectorAll('.laterpay-under-overlay'));
})(document);