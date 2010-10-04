class ListsController < ApplicationController
  
  respond_to :html, :json
  
  def index
    respond_with(@lists = List.all, :status => :ok, :notice => 'All Lists!')
  end

  def show
    respond_with(@list = List.find(params[:id]))
  end

  def new
    respond_with(@list = List.new)
  end

  def edit
    respond_with(@list = List.find(params[:id]))
  end

  def create
    @list = List.new(params[:list])
    @list.owner = User.first #obviously this is just temporary.
    @list.save
    respond_with(@list)
  end

  def update
    @list = List.find(params[:id])
    @list.update_attributes(params[:list])
    respond_with(@list)
  end

  def destroy
    @list = List.find(params[:id])
    @list.destroy
    respond_with(@list)
  end
end
