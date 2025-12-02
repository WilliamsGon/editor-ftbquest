
/**
 * SNBT Parser and Stringifier
 * Handles Minecraft's SNBT format including:
 * - Unquoted keys
 * - Suffixes: L (long), d (double), b (byte), f (float), s (short)
 * - Boolean true/false
 * - Lists [] and Objects {}
 * - Comments (basic support)
 */

export const SNBT = {
    parse: (input) => {
        let index = 0;
        const length = input.length;

        function skipWhitespace() {
            while (index < length) {
                const char = input[index];
                if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
                    index++;
                } else if (char === '#') {
                    // Skip comment until newline
                    while (index < length && input[index] !== '\n') {
                        index++;
                    }
                } else {
                    break;
                }
            }
        }

        function parseValue() {
            skipWhitespace();
            if (index >= length) return null;

            const char = input[index];

            if (char === '{') return parseObject();
            if (char === '[') return parseList();
            if (char === '"' || char === "'") return parseString();
            if (char === 't' && input.startsWith('true', index)) {
                index += 4;
                return true;
            }
            if (char === 'f' && input.startsWith('false', index)) {
                index += 5;
                return false;
            }

            return parseNumberOrUnquotedString();
        }

        function parseObject() {
            index++; // skip '{'
            const obj = {};

            while (index < length) {
                skipWhitespace();
                if (input[index] === '}') {
                    index++;
                    return obj;
                }

                const key = parseKey();
                skipWhitespace();

                if (input[index] === ':') {
                    index++;
                }

                const value = parseValue();
                obj[key] = value;

                skipWhitespace();
                if (input[index] === ',') {
                    index++;
                }
            }
            throw new Error("Unclosed object");
        }

        function parseList() {
            index++; // skip '['
            const list = [];

            while (index < length) {
                skipWhitespace();
                if (input[index] === ']') {
                    index++;
                    return list;
                }

                const value = parseValue();
                list.push(value);

                skipWhitespace();
                if (input[index] === ',') {
                    index++;
                }
            }
            throw new Error("Unclosed list");
        }

        function parseKey() {
            const char = input[index];
            if (char === '"' || char === "'") return parseString();
            return parseUnquotedString();
        }

        function parseString() {
            const quote = input[index++];
            let str = '';
            while (index < length) {
                const char = input[index++];
                if (char === quote) return str;
                if (char === '\\') {
                    str += input[index++];
                } else {
                    str += char;
                }
            }
            throw new Error("Unclosed string");
        }

        function parseUnquotedString() {
            let start = index;
            while (index < length) {
                const char = input[index];
                if (/[a-zA-Z0-9_\.\-\+]/.test(char)) {
                    index++;
                } else {
                    break;
                }
            }
            return input.substring(start, index);
        }

        function parseNumberOrUnquotedString() {
            const start = index;
            while (index < length) {
                const char = input[index];
                if (/[a-zA-Z0-9_\.\-\+]/.test(char)) {
                    index++;
                } else {
                    break;
                }
            }
            const raw = input.substring(start, index);

            // Check for suffixes
            const lastChar = raw.slice(-1).toLowerCase();
            if (['l', 'd', 'b', 'f', 's'].includes(lastChar)) {
                const val = raw.slice(0, -1);
                if (!isNaN(Number(val))) {
                    // Store as object to preserve type
                    return { value: Number(val), type: raw.slice(-1), _snbt_number: true };
                }
            }

            if (!isNaN(Number(raw)) && raw.trim() !== '') {
                return Number(raw);
            }

            return raw;
        }

        return parseValue();
    },

    stringify: (data) => {
        function stringifyValue(val, indent = '') {
            if (val === null) return 'null';
            if (typeof val === 'boolean') return val ? 'true' : 'false';
            if (typeof val === 'number') return String(val);
            if (typeof val === 'string') {
                // Quote if necessary
                // It must be safe characters
                // It must NOT be a number (JS number)
                // It must NOT be a boolean/null keyword
                // It must NOT look like an SNBT number (e.g. 123L, 1.5d)

                const isSafeChars = /^[a-zA-Z0-9_\.\-\+]+$/.test(val);
                const isJsNumber = !isNaN(Number(val));
                const isKeyword = ['true', 'false', 'null'].includes(val);
                const isSnbtNumber = /^-?\d+(\.\d+)?[lfdbs]?$/i.test(val);

                if (isSafeChars && !isJsNumber && !isKeyword && !isSnbtNumber) {
                    return val;
                }
                return JSON.stringify(val);
            }
            if (Array.isArray(val)) {
                if (val.length === 0) return '[ ]';
                // Check if simple list (primitives) to keep on one line? 
                // For now, pretty print everything for readability
                const items = val.map(v => stringifyValue(v, indent + '\t')).join('\n' + indent + '\t');
                // If items are short, maybe inline? Let's stick to multiline for safety and readability
                if (val.length < 5 && items.length < 50 && !items.includes('\n')) {
                    return `[ ${val.map(v => stringifyValue(v, '')).join(', ')} ]`;
                }
                return `[\n${indent}\t${val.map(v => stringifyValue(v, indent + '\t')).join('\n' + indent + '\t')}\n${indent}]`;
            }
            if (typeof val === 'object') {
                if (val._snbt_number) {
                    return `${val.value}${val.type}`;
                }

                const keys = Object.keys(val);
                if (keys.length === 0) return '{}';

                const props = keys.map(key => {
                    const k = /^[a-zA-Z0-9_\.\-\+]+$/.test(key) ? key : JSON.stringify(key);
                    return `${k}: ${stringifyValue(val[key], indent + '\t')}`;
                });

                return `{\n${indent}\t${props.join('\n' + indent + '\t')}\n${indent}}`;
            }
            return String(val);
        }

        return stringifyValue(data);
    }
};
