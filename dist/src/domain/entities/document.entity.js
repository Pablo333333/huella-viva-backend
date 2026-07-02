"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
class Document {
    constructor(partial) {
        Object.assign(this, partial);
    }
    id;
    name;
    url;
    type;
    version;
    isLatest;
    extractedText;
    userId;
    ticketId;
    createdAt;
    updatedAt;
}
exports.Document = Document;
//# sourceMappingURL=document.entity.js.map