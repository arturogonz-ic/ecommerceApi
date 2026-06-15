import { placeOrder } from '../service/placeOrder.js';
import { getOrdersByUser } from '../service/getOrdersByUser.js';
import { getOrderById } from '../service/getOrderById.js';
import { getAllOrders } from '../service/getAllOrders.js';
import { transitionStatus } from '../service/transitionStatus.js';
import { placeOrderSchema, transitionStatusSchema, orderIdSchema, listOrdersSchema } from '../validation/index.js';
import { success } from '../../shared/response/index.js';

export const createOrder = async (req, res, next) => {
  try {
    const { items } = placeOrderSchema.parse(req.body);
    const order = await placeOrder(req.user._id, items);
    res.status(201).json(success({ order }));
  } catch (err) {
    next(err);
  }
};

export const myOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersByUser(req.user._id);
    res.json(success({ orders }));
  } catch (err) {
    next(err);
  }
};

export const myOrderDetail = async (req, res, next) => {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const order = await getOrderById(id, req.user._id);
    res.json(success({ order }));
  } catch (err) {
    next(err);
  }
};

export const allOrders = async (req, res, next) => {
  try {
    const filters = listOrdersSchema.parse(req.query);
    const orders = await getAllOrders(filters);
    res.json(success({ orders }));
  } catch (err) {
    next(err);
  }
};

export const orderDetail = async (req, res, next) => {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const order = await getOrderById(id);
    res.json(success({ order }));
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = orderIdSchema.parse(req.params);
    const { status, shippingCarrier, trackingId } = transitionStatusSchema.parse(req.body);
    const order = await transitionStatus(id, status, { shippingCarrier, trackingId });
    res.json(success({ order }));
  } catch (err) {
    next(err);
  }
};
