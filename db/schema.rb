# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20110130220851) do

  create_table "filters", :force => true do |t|
    t.string    "name"
    t.string    "searchtext"
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.integer   "user_id"
  end

  create_table "filters_tags", :id => false, :force => true do |t|
    t.integer "filter_id"
    t.integer "tag_id"
  end

  create_table "list_items", :force => true do |t|
    t.text      "body"
    t.boolean   "completed",      :default => false, :null => false
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.integer   "list_id"
    t.integer   "parent_item_id"
    t.datetime  "deadline"
  end

  create_table "lists", :force => true do |t|
    t.string    "title"
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.integer   "owner_id"
  end

  create_table "lists_tags", :id => false, :force => true do |t|
    t.integer "list_id"
    t.integer "tag_id"
  end

  create_table "lists_users", :id => false, :force => true do |t|
    t.integer "list_id"
    t.integer "user_id"
  end

  create_table "tags", :force => true do |t|
    t.string    "name"
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.string    "color_class"
    t.integer   "user_id"
  end

  create_table "users", :force => true do |t|
    t.string    "username",                                               :null => false
    t.string    "email",                               :default => "",    :null => false
    t.string    "encrypted_password",   :limit => 128, :default => "",    :null => false
    t.string    "password_salt",                       :default => "",    :null => false
    t.string    "reset_password_token"
    t.string    "remember_token"
    t.timestamp "remember_created_at"
    t.integer   "sign_in_count",                       :default => 0
    t.timestamp "current_sign_in_at"
    t.timestamp "last_sign_in_at"
    t.string    "current_sign_in_ip"
    t.string    "last_sign_in_ip"
    t.string    "confirmation_token"
    t.timestamp "confirmed_at"
    t.timestamp "confirmation_sent_at"
    t.timestamp "created_at"
    t.timestamp "updated_at"
    t.string    "time_zone",                           :default => "UTC", :null => false
    t.boolean   "email_dashboard",                     :default => false, :null => false
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true
  add_index "users", ["username"], :name => "index_users_on_username", :unique => true

end
