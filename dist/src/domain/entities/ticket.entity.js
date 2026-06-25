"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
class Ticket {
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
    categoryName;
    statusName;
    documents;
    constructor(props) {
        Object.assign(this, props);
    }
}
exports.Ticket = Ticket;
//# sourceMappingURL=ticket.entity.js.map