UPDATE activity_logs SET action_group = 'SHOPPING' WHERE action_type IN ('ADD_TO_CART', 'REMOVE_FROM_CART', 'CLEAR_CART', 'PLACE_ORDER', 'CANCEL_ORDER_REQUEST');
UPDATE activity_logs SET action_group = 'ACCOUNT' WHERE action_type IN ('LOGIN', 'LOGIN_GOOGLE', 'REGISTER', 'CHANGE_PASSWORD', 'LOCK_USER', 'UNLOCK_USER');
UPDATE activity_logs SET action_group = 'SYSTEM' WHERE action_group IN ('HỆ THỐNG', 'TÀI KHOẢN', 'MUA SẮM');
