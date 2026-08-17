abstract class Notification{

    abstract send(to: string): void;
    label(){
        return "Notification"
    }


}

class EmailNotification extends Notification{

    constructor(){
        super();
    }

    send(to: string): void{
        console.log(`Email send to ${to}`)
    }
}

class SmsNotification extends Notification{

    constructor(){
        super();
    }

    send(to: string): void{
        console.log(`Sms to ${to}`)
    }
}

const emailHandler = new EmailNotification()
const smsHandler = new SmsNotification()

// const onlyNotify = new Notification - Cannot create an instance of an abstract class.

emailHandler.send("kishore@x.com")
smsHandler.send("999999")
console.log(smsHandler.label())