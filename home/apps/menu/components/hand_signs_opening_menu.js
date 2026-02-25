// function check_menu_trigger() {
    //     current_hand_sign =""
    //     if (hands_sign != undefined && hands_sign.length != 0) {
    //         current_hand_sign = hands_sign[0][0];

    //         if (menu_state == false) {
    //             if (current_hand_sign == "FIST" || current_hand_sign == "THUMB_UP" || current_hand_sign == "PINCH") {
    //                 trigger_menu = true;
    //                 counter_menu_trigger = 0;
    //             }
    //             if (trigger_menu == true) {
    //                 counter_menu_trigger++;
    //                 if (counter_menu_trigger > 25) {
    //                     trigger_menu = false;
    //                     counter_menu_trigger = 0;
    //                 }
    //                 if (current_hand_sign == "OPEN_HAND") {
    //                     menu_is_opening = true;
    //                     menu_is_closing = false;
    //                     menu_state = true;
    //                     trigger_menu = false;
    //                     counter_menu_trigger = 0;
    //                 }
    //             }   
    //         }
    //         else
    //         {
    //             if (current_hand_sign == "OPEN_HAND") {
    //                 trigger_menu = true;
    //                 counter_menu_trigger = 0;
    //             }
    //             if (trigger_menu == true) {
    //                 counter_menu_trigger++;
    //                 if (counter_menu_trigger > 25) {
    //                     trigger_menu = false;
    //                     counter_menu_trigger = 0;
    //                 }
    //                 if (current_hand_sign == "FIST" || current_hand_sign == "THUMB_UP" || current_hand_sign == "THUMB_UP") {
    //                     menu_is_opening = false;
    //                     menu_is_closing = true;
    //                     menu_state = false;
    //                     trigger_menu = false;
    //                     counter_menu_trigger = 0;
    //                 }
    //             }   
    //         }
    //     }
    // }