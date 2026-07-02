"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
class Ticket {
    constructor(partial) {
        Object.assign(this, partial);
    }
    id;
    title;
    description;
    latitude;
    longitude;
    workflowStateId;
    categoryId;
    userId;
    priority;
    isArchived;
    createdAt;
    updatedAt;
    documents;
    history;
    comments;
    statusName;
    categoryName;
    userName;
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map