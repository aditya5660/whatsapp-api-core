"use strict";
/*
 * edge-js
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Processor = void 0;
/**
 * Exposes the API to register a set of handlers to process the
 * templates output at different stages
 */
class Processor {
    constructor() {
        this.handlers = new Map();
    }
    /**
     * Execute tag handler
     */
    executeTag(data) {
        const handlers = this.handlers.get('tag');
        if (!handlers) {
            return;
        }
        handlers.forEach((handler) => {
            handler(data);
        });
    }
    /**
     * Execute raw handlers
     */
    executeRaw(data) {
        const handlers = this.handlers.get('raw');
        if (!handlers) {
            return data.raw;
        }
        handlers.forEach((handler) => {
            const output = handler(data);
            if (output !== undefined) {
                data.raw = output;
            }
        });
        return data.raw;
    }
    /**
     * Execute compiled handlers
     */
    executeCompiled(data) {
        const handlers = this.handlers.get('compiled');
        if (!handlers) {
            return data.compiled;
        }
        handlers.forEach((handler) => {
            const output = handler(data);
            if (output !== undefined) {
                data.compiled = output;
            }
        });
        return data.compiled;
    }
    /**
     * Execute output handlers
     */
    executeOutput(data) {
        const handlers = this.handlers.get('output');
        if (!handlers) {
            return data.output;
        }
        handlers.forEach((handler) => {
            const output = handler(data);
            if (output !== undefined) {
                data.output = output;
            }
        });
        return data.output;
    }
    process(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, new Set());
        }
        this.handlers.get(event).add(handler);
        return this;
    }
}
exports.Processor = Processor;
