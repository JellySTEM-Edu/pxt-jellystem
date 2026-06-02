#include "pxt.h"

//% color=50 weight=80
//% icon="\uf1eb"
namespace mShieldInfrared { 
    int ir_code = 0x00;
    int ir_addr = 0x00;
    int data;

    int logic_value(){   //A function to read the logical values "0" and "1".
        uint32_t lasttime = system_timer_current_time_us();
        uint32_t nowtime;
        while(!uBit.io.P12.getDigitalValue());                          //Wait for the low level
        nowtime = system_timer_current_time_us();
        if((nowtime - lasttime) > 350 && (nowtime - lasttime) < 850){   //low level 560us
            while(uBit.io.P12.getDigitalValue());                       //high level, wait
            lasttime = system_timer_current_time_us();
            if((lasttime - nowtime)>350 && (lasttime - nowtime) < 850){ //low level 560us
                return 0;
            }else if((lasttime - nowtime)>1350 && (lasttime - nowtime) < 1950){//high leve 1.7ms
                return 1;
        }
        }
        //uBit.serial.printf("error\r\n");
        return -1;
    }

    void pulse_deal(){
        int i;
        int num;
        ir_addr=0x00;  //clear operation
        for(i=0; i<16;i++ )
        {
            num = logic_value();
            if(num == 1)
            {
                ir_addr |=(1<<i);
            }else if (num == -1) {
                ir_addr = 0;
                break;
            }
        }
        //Parse the CMD instruction in the remote control encoding.
        ir_code=0x00;  //clear operation
        for(i=0; i<16;i++ )
        {
            if(logic_value() == 1)
            {
                ir_code |=(1<<i);
            }else if (num == -1) {
                ir_code = 0; 
                break;
            }
        }
    }

    void remote_decode(void){
        data = 0x00;
        uint32_t lasttime = system_timer_current_time_us();
        uint32_t nowtime;
        while(uBit.io.P12.getDigitalValue()){//high level, wait
            nowtime = system_timer_current_time_us();
            if((nowtime - lasttime) > 100000){//More than 100 milliseconds, indicating that no key was pressed.
                ir_code = 0xffff;
                return;
            }
        }
        //If the high level does not last more than 100ms
        lasttime = system_timer_current_time_us();
        while(!uBit.io.P12.getDigitalValue());//low level, wait
        nowtime = system_timer_current_time_us();
        if((nowtime - lasttime) < 10000 && (nowtime - lasttime) > 5000){//9ms
            while(uBit.io.P12.getDigitalValue());//high level, wait
            lasttime = system_timer_current_time_us();
            // 4.5ms, the infrared protocol header is received and the data is newly sent. Start parsing logic 0 and 1
            if((lasttime - nowtime) > 4000 && (lasttime - nowtime) < 5000){
                pulse_deal();
                //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                data = ir_code;
                return;//ir_code;
            //2.25ms, which means the same packet was sent as the previous one
            }else if((lasttime - nowtime) > 2000 && (lasttime - nowtime) < 2500){
                while(!uBit.io.P12.getDigitalValue());//low level, wait
                nowtime = system_timer_current_time_us();
                if((nowtime - lasttime) > 500 && (nowtime - lasttime) < 700){//560us
                    //uBit.serial.printf("addr=0x%X,code = 0x%X\r\n",ir_addr,ir_code);
                    data = ir_code;
                    return;//ir_code;
                }
            }
        }
    }

    //% 
    int irCode(){
        remote_decode();
        return data;
    }

    //%
    int readPulseIn(int status){
        uint32_t lasttime,nowtime,temp;
        if(status == 1){//HIGH
            lasttime = system_timer_current_time_us();
            while(!uBit.io.P12.getDigitalValue()){ 
                temp = system_timer_current_time_us();
                if((temp - lasttime) > 70000){
                    //uBit.serial.printf("time out 0 %d\r\n",(temp-lasttime));
                    return -1;
                }
            }
            lasttime = system_timer_current_time_us();
            while(uBit.io.P12.getDigitalValue()){
                if((system_timer_current_time_us() - lasttime) > 70000){
                    //uBit.serial.printf("time out 1");
                    return -1;
                }
            }
            nowtime = system_timer_current_time_us();
        }else{//LOW
            while(uBit.io.P12.getDigitalValue()){
                if((system_timer_current_time_us() - lasttime) > 70000){
                    //uBit.serial.printf("time out 3");
                    return -1;
                }
            }
            lasttime = system_timer_current_time_us();
            while(!uBit.io.P12.getDigitalValue()){
                if((system_timer_current_time_us() - lasttime) > 70000){
                    //uBit.serial.printf("time out 4");
                    return -1;
                }
            }
            nowtime = system_timer_current_time_us();
        }
        return (nowtime - lasttime);
    }
}
